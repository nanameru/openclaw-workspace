import Foundation
import SwiftUI

@MainActor
final class GenerateViewModel: ObservableObject {
    @Published var prompt: String = "被写体に自然なカメラズームを追加"
    @Published var aspectRatio: AspectRatio = .vertical
    @Published var resolution: Resolution = .p720
    @Published var seconds: ClipSeconds = .s5
    @Published var highQuality: Bool = false
    @Published var selectedImage: UIImage?

    @Published var jobId: String?
    @Published var statusText: String = "待機中"
    @Published var outputURL: String?
    @Published var errorMessage: String?
    @Published var isLoading = false
    @Published var history: [JobHistoryItem] = []

    private let apiClient: APIClient

    init(apiClient: APIClient = APIClient()) {
        self.apiClient = apiClient
        self.history = HistoryStore.load()
    }

    var estimatedCredits: Int {
        let base = 10.0
        let r: Double = resolution == .p720 ? 1.0 : (resolution == .p1080 ? 1.8 : 3.5)
        let s: Double = seconds == .s5 ? 1.0 : (seconds == .s10 ? 1.7 : 2.4)
        let q: Double = highQuality ? 1.2 : 1.0
        return Int((base * r * s * q).rounded())
    }

    func submit() async {
        guard let image = selectedImage, let imageData = image.jpegData(compressionQuality: 0.92) else {
            errorMessage = "画像を選択してください"
            return
        }

        isLoading = true
        errorMessage = nil
        outputURL = nil

        do {
            let response = try await apiClient.createJob(
                imageData: imageData,
                prompt: prompt,
                aspectRatio: aspectRatio,
                resolution: resolution,
                seconds: seconds,
                highQuality: highQuality,
                estimatedCredits: estimatedCredits
            )
            jobId = response.jobId
            statusText = normalizedStatus(response.status)
            history.insert(
                JobHistoryItem(
                    id: response.jobId,
                    estimatedCredits: estimatedCredits,
                    createdAt: Date(),
                    status: normalizedStatus(response.status),
                    outputUrl: nil,
                    errorMessage: nil
                ),
                at: 0
            )
            trimHistoryIfNeeded()
            persistHistory()
            await pollStatus(jobId: response.jobId)
        } catch {
            errorMessage = normalizeError(error.localizedDescription)
        }

        isLoading = false
    }

    private func pollStatus(jobId: String) async {
        for _ in 0..<60 {
            do {
                let s = try await apiClient.fetchJobStatus(jobId: jobId)
                let jpStatus = normalizedStatus(s.status)
                statusText = jpStatus
                updateHistory(jobId: jobId, status: jpStatus, outputUrl: s.outputUrl, errorMessage: s.errorMessage)

                if s.status == "done" {
                    outputURL = s.outputUrl
                    return
                }
                if s.status == "failed" {
                    let message = normalizeError(s.errorMessage ?? "生成に失敗しました")
                    errorMessage = message
                    updateHistory(jobId: jobId, status: "失敗", outputUrl: s.outputUrl, errorMessage: message)
                    return
                }
            } catch {
                let message = normalizeError(error.localizedDescription)
                errorMessage = message
                updateHistory(jobId: jobId, status: "失敗", outputUrl: nil, errorMessage: message)
                return
            }
            try? await Task.sleep(for: .seconds(1.2))
        }

        let timeout = "タイムアウトしました。時間を置いて再確認してください。"
        errorMessage = timeout
        updateHistory(jobId: jobId, status: "失敗", outputUrl: nil, errorMessage: timeout)
    }

    private func updateHistory(jobId: String, status: String, outputUrl: String?, errorMessage: String?) {
        guard let index = history.firstIndex(where: { $0.id == jobId }) else { return }
        history[index].status = status
        history[index].outputUrl = outputUrl
        history[index].errorMessage = errorMessage
        persistHistory()
    }

    private func trimHistoryIfNeeded() {
        if history.count > 50 {
            history = Array(history.prefix(50))
        }
    }

    private func persistHistory() {
        HistoryStore.save(history)
    }

    private func normalizedStatus(_ status: String) -> String {
        switch status.lowercased() {
        case "queued": return "待機中"
        case "starting", "processing", "running": return "生成中"
        case "done", "succeeded": return "完了"
        case "failed", "canceled": return "失敗"
        default: return status
        }
    }

    private func normalizeError(_ raw: String) -> String {
        let lower = raw.lowercased()
        if lower.contains("401") || lower.contains("403") {
            return "認証エラーです。APIキー設定を確認してください。"
        }
        if lower.contains("429") {
            return "現在混雑しています。少し待ってから再実行してください。"
        }
        if lower.contains("413") {
            return "画像サイズが大きすぎます。10MB以下で再試行してください。"
        }
        if lower.contains("timed out") || lower.contains("timeout") {
            return "通信がタイムアウトしました。ネットワーク状況を確認してください。"
        }
        if lower.contains("failed to parse") || lower.contains("decode") {
            return "サーバー応答の解析に失敗しました。"
        }
        return raw
    }
}
