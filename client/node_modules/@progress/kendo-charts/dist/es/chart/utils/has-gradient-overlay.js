export default function hasGradientOverlay(options) {
    var overlay = options.overlay;

    return overlay && overlay.gradient && overlay.gradient !== "none";
}