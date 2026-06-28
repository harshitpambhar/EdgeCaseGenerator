"""
SQLAlchemy models for the testing generator platform database.
"""
from __future__ import annotations

import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    req_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    constraints = Column(Text, nullable=True)  # JSON-serialized list of constraints
    actions = Column(Text, nullable=True)      # JSON-serialized list of actions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    test_cases = relationship("TestCase", back_populates="requirement")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    repo_path = Column(String(250), nullable=False)
    language = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    functions = relationship("ParsedFunction", back_populates="repository", cascade="all, delete-orphan")
    coverage_reports = relationship("CoverageReport", back_populates="repository", cascade="all, delete-orphan")


class ParsedFunction(Base):
    __tablename__ = "parsed_functions"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    class_name = Column(String(100), nullable=True)
    file_path = Column(String(250), nullable=False)
    code = Column(Text, nullable=False)
    complexity = Column(Integer, default=1)
    parameters = Column(Text, nullable=True)  # JSON-serialized list of parameter details
    returns = Column(String(50), nullable=True)
    exceptions = Column(Text, nullable=True)  # JSON-serialized list of exception strings
    dependencies = Column(Text, nullable=True)  # JSON-serialized dependency/call graph connections
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="functions")
    test_cases = relationship("TestCase", back_populates="function", cascade="all, delete-orphan")


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    tc_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=True)
    function_id = Column(Integer, ForeignKey("parsed_functions.id"), nullable=True)
    preconditions = Column(Text, nullable=True)
    test_data = Column(Text, nullable=True)        # JSON-serialized dictionary/list of inputs
    execution_steps = Column(Text, nullable=True)  # JSON-serialized list of steps
    expected_result = Column(Text, nullable=True)
    priority = Column(String(20), default="Medium")
    severity = Column(String(20), default="Minor")
    coverage = Column(Float, default=0.0)
    category = Column(String(50), default="Functional")
    boundary_info = Column(Text, nullable=True)
    equivalence_class_info = Column(Text, nullable=True)
    decision_table_ref = Column(Text, nullable=True)
    state_transition_ref = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    requirement = relationship("Requirement", back_populates="test_cases")
    function = relationship("ParsedFunction", back_populates="test_cases")


class CoverageReport(Base):
    __tablename__ = "coverage_reports"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    req_coverage = Column(Float, default=0.0)
    code_coverage = Column(Float, default=0.0)
    func_coverage = Column(Float, default=0.0)
    branch_coverage = Column(Float, default=0.0)
    loop_coverage = Column(Float, default=0.0)
    cond_coverage = Column(Float, default=0.0)
    api_coverage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="coverage_reports")
