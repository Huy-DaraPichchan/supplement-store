from io import StringIO

from sqlalchemy import func, select

from app import cli
from app.cli import SeedProgress
from app.models import Product


class InteractiveStream(StringIO):
    def isatty(self) -> bool:
        return True


def test_seed_progress_renders_live_bar_for_interactive_terminal():
    stream = InteractiveStream()

    with SeedProgress("Products", 2, stream=stream) as progress:
        progress.advance(created=1, skipped=0)
        progress.advance(created=1, skipped=1)

    output = stream.getvalue()
    assert "\rProducts: [------------------------------] 0/2 (  0%)" in output
    assert "\rProducts: [###############---------------] 1/2 ( 50%)" in output
    assert "\rProducts: [##############################] 2/2 (100%)" in output
    assert output.endswith("| created: 1 | skipped: 1\n")


def test_seed_progress_uses_periodic_lines_for_non_interactive_logs():
    stream = StringIO()

    with SeedProgress("Orders", 25, stream=stream) as progress:
        for current in range(1, 26):
            progress.advance(created=current, skipped=0)

    assert stream.getvalue().splitlines() == [
        "Orders: 0/25 (  0%) | created: 0 | skipped: 0",
        "Orders: 10/25 ( 40%) | created: 10 | skipped: 0",
        "Orders: 20/25 ( 80%) | created: 20 | skipped: 0",
        "Orders: 25/25 (100%) | created: 25 | skipped: 0",
    ]


def test_seed_progress_ends_interactive_line_when_seeding_fails():
    stream = InteractiveStream()

    try:
        with SeedProgress("Products", 2, stream=stream) as progress:
            progress.advance(created=1, skipped=0)
            raise RuntimeError("upload failed")
    except RuntimeError:
        pass

    assert stream.getvalue().endswith("\n")


def test_seed_products_reports_created_and_skipped_products(db, capsys, monkeypatch):
    manifest = cli.load_manifest()
    manifest["products"] = manifest["products"][:2]
    monkeypatch.setattr(cli, "load_manifest", lambda: manifest)
    monkeypatch.setattr(
        cli,
        "upload_bytes",
        lambda content, content_type, suffix: (f"products/test{suffix}", "https://example.test"),
    )

    cli.seed_products()
    cli.seed_products()
    output = capsys.readouterr().out

    assert "Products: 2/2 (100%) | created: 2 | skipped: 0" in output
    assert "Products: 2/2 (100%) | created: 0 | skipped: 2" in output
    assert db.scalar(select(func.count()).select_from(Product)) == 2
