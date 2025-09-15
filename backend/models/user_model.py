class User:
    def __init__(self, username: str, name: str, email: str, password_hash: str):
        self.username = username
        self.name = name
        self.email = email
        self.password_hash = password_hash