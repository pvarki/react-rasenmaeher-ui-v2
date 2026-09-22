KIND_CONTEXT = "kind-rmk8soperator"
IMAGE = "rmui"
VITE_THEME = os.getenv("VITE_THEME", "default")
DEV_PORT = os.getenv("RMUI_DEV_PORT", "8080")

allow_k8s_contexts(KIND_CONTEXT)
if k8s_context() != KIND_CONTEXT:
    fail("Wrong kube context %r, use --context %s" % (k8s_context(), KIND_CONTEXT))

watch_settings(ignore=["**/node_modules/**", "**/dist/**", "**/.devspace/**"])

docker_build(
    IMAGE,
    ".",
    dockerfile="Dockerfile",
    target="dev",
    build_args={"VITE_THEME": VITE_THEME},
    ignore=[
        ".env",
        ".env.*",
        ".devspace/",
        "devspace.yaml",
        "Tiltfile",
        "tilt/",
        "*.md",
        ".github/",
    ],
    live_update=[
        sync("./src", "/app/src"),
        sync("./public", "/app/public"),
        sync("./index.html", "/app/index.html"),
    ],
)

k8s_yaml(["tilt/rmui.yaml", "tilt/ingressroute-rmui.yaml"])

k8s_resource(
    "rmui",
    objects=["rmui:ingressroute:opendefence-system"],
    port_forwards="%s:8080" % DEV_PORT,
    links=[
        link("https://localmaeher.dev.pvarki.fi/", "UI"),
        link("https://mtls.localmaeher.dev.pvarki.fi/", "UI (mtls)"),
    ],
)
