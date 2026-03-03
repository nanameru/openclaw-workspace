import Foundation

final class APIClient {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL = URL(string: "http://localhost:3000")!, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    func createJob(imageData: Data, prompt: String, aspectRatio: AspectRatio, resolution: Resolution, seconds: ClipSeconds, highQuality: Bool, estimatedCredits: Int) async throws -> GenerateResponse {
        let url = baseURL.appendingPathComponent("api/generate")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.httpBody = makeBody(boundary: boundary, imageData: imageData, prompt: prompt, aspectRatio: aspectRatio, resolution: resolution, seconds: seconds, highQuality: highQuality, estimatedCredits: estimatedCredits)

        let (data, response) = try await session.data(for: request)
        try validate(response: response, data: data)
        return try JSONDecoder().decode(GenerateResponse.self, from: data)
    }

    func fetchJobStatus(jobId: String) async throws -> JobStatusResponse {
        let url = baseURL.appendingPathComponent("api/generate/\(jobId)")
        let (data, response) = try await session.data(from: url)
        try validate(response: response, data: data)
        return try JSONDecoder().decode(JobStatusResponse.self, from: data)
    }

    private func validate(response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else { throw URLError(.badServerResponse) }
        guard (200...299).contains(http.statusCode) else {
            let text = String(data: data, encoding: .utf8) ?? "サーバーエラー"
            throw NSError(domain: "api", code: http.statusCode, userInfo: [NSLocalizedDescriptionKey: text])
        }
    }

    private func makeBody(boundary: String, imageData: Data, prompt: String, aspectRatio: AspectRatio, resolution: Resolution, seconds: ClipSeconds, highQuality: Bool, estimatedCredits: Int) -> Data {
        var body = Data()
        func append(_ string: String) { body.append(string.data(using: .utf8)!) }

        append("--\(boundary)\r\n")
        append("Content-Disposition: form-data; name=\"image\"; filename=\"upload.jpg\"\r\n")
        append("Content-Type: image/jpeg\r\n\r\n")
        body.append(imageData)
        append("\r\n")

        let fields: [String: String] = [
            "prompt": prompt,
            "aspectRatio": aspectRatio.rawValue,
            "resolution": resolution.rawValue,
            "seconds": String(seconds.rawValue),
            "highQuality": highQuality ? "true" : "false",
            "estimatedCredits": String(estimatedCredits)
        ]

        for (k, v) in fields {
            append("--\(boundary)\r\n")
            append("Content-Disposition: form-data; name=\"\(k)\"\r\n\r\n")
            append(v)
            append("\r\n")
        }

        append("--\(boundary)--\r\n")
        return body
    }
}
