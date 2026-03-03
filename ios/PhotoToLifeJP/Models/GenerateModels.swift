import Foundation

enum AspectRatio: String, CaseIterable, Identifiable {
    case vertical = "9:16"
    case square = "1:1"
    case horizontal = "16:9"
    var id: String { rawValue }
}

enum Resolution: String, CaseIterable, Identifiable {
    case p720 = "720p"
    case p1080 = "1080p"
    case p4k = "4k"
    var id: String { rawValue }
}

enum ClipSeconds: Int, CaseIterable, Identifiable {
    case s5 = 5
    case s10 = 10
    case s15 = 15
    var id: Int { rawValue }
}

struct GenerateResponse: Decodable {
    let jobId: String
    let status: String
    let message: String
}

struct JobStatusResponse: Decodable {
    let id: String
    let status: String
    let outputUrl: String?
    let errorMessage: String?
}

struct JobHistoryItem: Identifiable {
    let id: String
    let estimatedCredits: Int
    let createdAt: Date
    var status: String
    var outputUrl: String?
    var errorMessage: String?
}
