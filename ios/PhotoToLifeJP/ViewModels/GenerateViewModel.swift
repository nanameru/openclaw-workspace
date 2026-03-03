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

    private let apiClient: APIClient

    init(apiClient: APIClient = APIClient()) {
        self.apiClient = apiClient
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
            statusText = response.status
            await pollStatus(jobId: response.jobId)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    private func pollStatus(jobId: String) async {
        for _ in 0..<60 {
            do {
                let s = try await apiClient.fetchJobStatus(jobId: jobId)
                statusText = s.status
                if s.status == "done" {
                    outputURL = s.outputUrl
                    return
                }
                if s.status == "failed" {
                    errorMessage = s.errorMessage ?? "生成に失敗しました"
                    return
                }
            } catch {
                errorMessage = error.localizedDescription
                return
            }
            try? await Task.sleep(for: .seconds(1.2))
        }
    }
}
