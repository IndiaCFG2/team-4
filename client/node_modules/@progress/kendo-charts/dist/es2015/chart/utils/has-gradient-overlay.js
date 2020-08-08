export default function hasGradientOverlay(options) {
    const overlay = options.overlay;

    return overlay && overlay.gradient && overlay.gradient !== "none";
}