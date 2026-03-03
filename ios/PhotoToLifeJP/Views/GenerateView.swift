import SwiftUI
import PhotosUI

private enum UI {
    static let radius: CGFloat = 14
    static let gap: CGFloat = 14
}

struct GenerateView: View {
    @StateObject var viewModel: GenerateViewModel
    @State private var pickerItem: PhotosPickerItem?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: UI.gap) {
                    headerCard
                    uploadCard
                    controlCard
                    statusCard
                    historyCard
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("生成")
            .onChange(of: pickerItem) {
                Task {
                    guard let item = pickerItem,
                          let data = try? await item.loadTransferable(type: Data.self),
                          let uiImage = UIImage(data: data) else { return }
                    viewModel.selectedImage = uiImage
                }
            }
        }
    }

    private var headerCard: some View {
        card {
            VStack(alignment: .leading, spacing: 8) {
                Text("Photo to Life JP")
                    .font(.title3).bold()
                Text("Pruna AI P-Video / Replicate")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text("出力動画は速度変更・追加編集なし")
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.orange.opacity(0.14))
                    .clipShape(Capsule())
            }
        }
    }

    private var uploadCard: some View {
        card {
            VStack(alignment: .leading, spacing: 10) {
                Text("画像")
                    .font(.headline)
                PhotosPicker("画像を選択", selection: $pickerItem, matching: .images)
                    .buttonStyle(.borderedProminent)
                if let image = viewModel.selectedImage {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 220)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }

    private var controlCard: some View {
        card {
            VStack(alignment: .leading, spacing: 10) {
                Text("設定")
                    .font(.headline)

                TextField("動きの説明", text: $viewModel.prompt, axis: .vertical)
                    .textFieldStyle(.roundedBorder)

                Picker("比率", selection: $viewModel.aspectRatio) {
                    ForEach(AspectRatio.allCases) { v in Text(v.rawValue).tag(v) }
                }
                .pickerStyle(.segmented)

                HStack {
                    Picker("解像度", selection: $viewModel.resolution) {
                        ForEach(Resolution.allCases) { v in Text(v.rawValue).tag(v) }
                    }
                    Picker("秒数", selection: $viewModel.seconds) {
                        ForEach(ClipSeconds.allCases) { v in Text("\(v.rawValue)s").tag(v) }
                    }
                }

                Toggle("高精細モード (+20%)", isOn: $viewModel.highQuality)

                Text("想定消費: 約 \(viewModel.estimatedCredits) クレジット")
                    .font(.headline)
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.blue.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                Button(viewModel.isLoading ? "送信中..." : "生成を開始") {
                    Task { await viewModel.submit() }
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(viewModel.isLoading)
            }
        }
    }

    private var statusCard: some View {
        card {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("状態")
                        .font(.headline)
                    Spacer()
                    StatusChip(status: viewModel.statusText)
                }

                if let id = viewModel.jobId {
                    Text("Job: \(id)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                if let output = viewModel.outputURL, let url = URL(string: output) {
                    Link("生成結果を開く", destination: url)
                        .font(.subheadline.weight(.semibold))
                }

                if let err = viewModel.errorMessage {
                    Text(err)
                        .foregroundStyle(.red)
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
    }

    private var historyCard: some View {
        card {
            VStack(alignment: .leading, spacing: 8) {
                Text("生成履歴")
                    .font(.headline)

                if viewModel.history.isEmpty {
                    Text("まだ履歴はありません")
                        .foregroundStyle(.secondary)
                        .font(.subheadline)
                } else {
                    ForEach(viewModel.history.prefix(10)) { item in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.id)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text("\(item.status) ・想定 \(item.estimatedCredits) クレジット")
                                .font(.subheadline)
                            if let message = item.errorMessage {
                                Text("エラー: \(message)")
                                    .font(.caption)
                                    .foregroundStyle(.red)
                            }
                            if let output = item.outputUrl, let url = URL(string: output) {
                                Link("結果を開く", destination: url)
                                    .font(.caption)
                            }
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                }
            }
        }
    }

    private func card<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) { content() }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: UI.radius))
            .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
    }
}

private struct StatusChip: View {
    let status: String

    var body: some View {
        Text(status)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(chipColor.opacity(0.15))
            .foregroundStyle(chipColor)
            .clipShape(Capsule())
    }

    private var chipColor: Color {
        if status.contains("完了") { return .green }
        if status.contains("失敗") { return .red }
        if status.contains("生成中") { return .orange }
        return .blue
    }
}
