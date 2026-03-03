import Foundation

enum HistoryStore {
    private static let key = "photo_to_life_history_v1"

    static func load() -> [JobHistoryItem] {
        guard let data = UserDefaults.standard.data(forKey: key) else { return [] }
        do {
            return try JSONDecoder().decode([JobHistoryItem].self, from: data)
        } catch {
            return []
        }
    }

    static func save(_ items: [JobHistoryItem]) {
        do {
            let data = try JSONEncoder().encode(items)
            UserDefaults.standard.set(data, forKey: key)
        } catch {
            // no-op for MVP
        }
    }
}
