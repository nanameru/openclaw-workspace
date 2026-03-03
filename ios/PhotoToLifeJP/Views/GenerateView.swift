import SwiftUI
import PhotosUI

struct GenerateView: View {
    @StateObject var viewModel: GenerateViewModel
    @State private var pickerItem: PhotosPickerItem?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Text("Photo to Life JP")
                        .font(.title2).bold()

                    PhotosPicker("画像を選択", selection: $pickerItem, matching: .images)
                        .buttonStyle(.borderedProminent)

                    if let image = viewModel.selectedImage {
                        Image(uiImage: image)
                            .resizable().scaledToFit()
                            .frame(maxHeight: 220)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

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
                        .background(Color.purple.opacity(0.12))
                        .clipShape(RoundedRectangle(cornerRadius: 10))

                    Button(viewModel.isLoading ? "送信中..." : "生成を開始") {
                        Task { await viewModel.submit() }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(viewModel.isLoading)

                    if let id = viewModel.jobId {
                        Text("Job: \(id)")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }

                    Text("状態: \(viewModel.statusText)")
                        .font(.subheadline)

                    if let output = viewModel.outputURL, let url = URL(string: output) {
                        Link("生成結果を開く", destination: url)
                    }

                    if let err = viewModel.errorMessage {
                        Text(err)
                            .foregroundStyle(.red)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }

                    if !viewModel.history.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("生成履歴")
                                .font(.headline)
                            ForEach(viewModel.history.prefix(10)) { item in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("\(item.id)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text("状態: \(item.status) / 想定: \(item.estimatedCredits)クレジット")
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
                                .background(Color.gray.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                        }
                        .padding(.top, 8)
                    }
                }
                .padding()
            }
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
}
