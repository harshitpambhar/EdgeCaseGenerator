import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
SRC_DIR = ROOT_DIR / 'parser-engine/sample_code'
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

import pytest
from sample import divide, check_age


def test_divide_0():
    assert divide(-1)


def test_divide_1():
    assert divide(0)


def test_divide_2():
    assert divide(1)


def test_check_age_0():
    assert check_age(17)


def test_check_age_1():
    assert check_age(18)


def test_check_age_2():
    assert check_age(19)

