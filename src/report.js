let severity = "";

function setSeverity(level, button) {
    severity = level;
    console.log("Selected Severity:", severity);

    // Remove active style from all buttons
    document.querySelectorAll(".severity-btn").forEach(btn => {
        btn.classList.remove("bg-primary", "text-white", "border-primary");
        btn.classList.add("border-outline-variant", "text-on-surface-variant");
    });

    // Highlight selected button
    button.classList.remove("border-outline-variant", "text-on-surface-variant");
    button.classList.add("bg-primary", "text-white", "border-primary");
}
