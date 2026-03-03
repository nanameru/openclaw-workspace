import SwiftUI

@main
struct PhotoToLifeJPApp: App {
    var body: some Scene {
        WindowGroup {
            GenerateView(viewModel: GenerateViewModel())
        }
    }
}
