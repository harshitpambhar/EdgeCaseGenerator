"""
Validation script for test download functionality.
Tests structure mapper, download service, and ZIP generation.
"""
import json
import tempfile
import zipfile
from pathlib import Path

from test_generation.structure_mapper import compute_test_path
from test_generation.download_service import create_download_archive
from shared.schemas.models import GeneratedTest


def test_structure_mapper():
    """Test path computation for different languages."""
    print("Testing Structure Mapper...")
    
    tests = [
        ("src/auth/login.py", "python", "tests/auth/test_login.py"),
        ("app/services/payment.py", "python", "tests/services/test_payment.py"),
        ("src/auth/login.js", "javascript", "src/auth/tests/login.test.js"),
        ("src/auth/login.ts", "typescript", "src/auth/tests/login.test.ts"),
        ("src/main/java/com/company/UserService.java", "java", "src/test/java/com/company/UserServiceTest.java"),
    ]
    
    for source, lang, expected in tests:
        result = compute_test_path(source, lang)
        status = "✓" if result == expected else "✗"
        print(f"  {status} {source} -> {result}")
        if result != expected:
            print(f"    Expected: {expected}")


def test_download_service():
    """Test ZIP archive creation."""
    print("\nTesting Download Service...")
    
    # Create sample tests
    tests = [
        GeneratedTest(
            function="login",
            test_name="test_login_0",
            condition="null_check",
            case=None,
            language="python",
            framework="pytest",
            code="import pytest\n\ndef test_login_0():\n    assert True",
            source_file="src/auth/login.py",
        ),
        GeneratedTest(
            function="payment",
            test_name="test_payment_0",
            condition="zero_amount",
            case=0,
            language="python",
            framework="pytest",
            code="import pytest\n\ndef test_payment_0():\n    assert True",
            source_file="src/services/payment.py",
        ),
        GeneratedTest(
            function="validate",
            test_name="validate_case_0",
            condition="empty_string",
            case="",
            language="javascript",
            framework="jest",
            code='test("validate_case_0", () => {\n  expect(true).toBe(true);\n});',
            source_file="src/utils/validator.js",
        ),
    ]
    
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        zip_path = tmp_path / "test_archive.zip"
        
        # Create archive
        result_path = create_download_archive(
            tests=tests,
            output_path=zip_path,
            files_parsed=10,
            functions_parsed=15,
        )
        
        # Validate ZIP
        if result_path.exists():
            print(f"  ✓ ZIP created: {result_path}")
            print(f"    Size: {result_path.stat().st_size} bytes")
            
            with zipfile.ZipFile(result_path, 'r') as zf:
                files = zf.namelist()
                print(f"    Files in archive: {len(files)}")
                
                # Check required files
                required = [
                    "test_manifest.json",
                    "generation_summary.md",
                ]
                for req in required:
                    if req in files:
                        print(f"      ✓ {req}")
                    else:
                        print(f"      ✗ Missing: {req}")
                
                # Check test files
                test_files = [f for f in files if f not in ("test_manifest.json", "generation_summary.md")]
                print(f"    Test files: {len(test_files)}")
                for tf in test_files:
                    print(f"      - {tf}")
                
                # Validate manifest
                if "test_manifest.json" in files:
                    manifest_data = zf.read("test_manifest.json")
                    manifest = json.loads(manifest_data)
                    print(f"    Manifest files: {manifest.get('total_test_files')}")
                
                # Validate summary
                if "generation_summary.md" in files:
                    summary_data = zf.read("generation_summary.md").decode()
                    if "Test Generation Summary" in summary_data:
                        print(f"    ✓ Summary is valid")
        else:
            print(f"  ✗ ZIP not created")


def test_edge_cases():
    """Test edge cases and error handling."""
    print("\nTesting Edge Cases...")
    
    # Test with missing source_file
    test_no_source = GeneratedTest(
        function="unknown",
        test_name="test_unknown",
        condition=None,
        case=None,
        language="python",
        framework="pytest",
        code="def test_unknown(): pass",
        source_file="",  # Empty source file
    )
    
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        zip_path = tmp_path / "edge_case.zip"
        
        try:
            create_download_archive(
                tests=[test_no_source],
                output_path=zip_path,
            )
            print("  ✓ Handles missing source_file")
        except Exception as e:
            print(f"  ✗ Failed: {e}")


if __name__ == "__main__":
    print("=" * 60)
    print("Test Download Feature Validation")
    print("=" * 60)
    
    test_structure_mapper()
    test_download_service()
    test_edge_cases()
    
    print("\n" + "=" * 60)
    print("Validation Complete")
    print("=" * 60)
