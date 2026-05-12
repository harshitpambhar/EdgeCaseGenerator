def divide(a, b):
    if b == 0:
        return None
    return a / b


def check_age(age):
    if age > 18:
        return "Adult"
    return "Minor"