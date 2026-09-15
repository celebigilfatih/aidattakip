import Foundation
import Vision
import ImageIO

// Decode rendered PDF pages, rather than merely checking the QR input string.
let expected = "https://aidat.spormanage.com.tr"
for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path)
    let handler = VNImageRequestHandler(url: url)
    let request = VNDetectBarcodesRequest()
    request.revision = VNDetectBarcodesRequestRevision1
    request.usesCPUOnly = true
    request.symbologies = [.qr]
    try handler.perform([request])
    let values = (request.results ?? []).compactMap { $0.payloadStringValue }
    guard values == [expected] else {
        fputs("QR check failed: \(url.lastPathComponent)\n", stderr)
        exit(1)
    }
    print("PASS \(url.lastPathComponent): one QR, correct demo URL")
}
