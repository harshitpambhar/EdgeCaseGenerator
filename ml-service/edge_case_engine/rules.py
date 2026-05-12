def boundary_triplet(value: int) -> list[int]:
    return [value - 1, value, value + 1]


RULES = {
    ">": boundary_triplet,
    "<": boundary_triplet,
    ">=": boundary_triplet,
    "<=": boundary_triplet,
    "==": boundary_triplet,
}
