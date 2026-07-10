import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    JSON,
    func
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    forms = relationship("Form", back_populates="owner", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="submitted_by_user")


class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="draft", nullable=False)  # draft, published, archived
    current_version = Column(Integer, nullable=True)
    createdat = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedat = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="forms")
    versions = relationship("FormVersion", back_populates="form", cascade="all, delete-orphan")


class FormVersion(Base):
    __tablename__ = "form_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    formid = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    ispublished = Column(Boolean, default=False, nullable=False)
    publishedat = Column(DateTime(timezone=True), nullable=True)
    createdat = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedat = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    form = relationship("Form", back_populates="versions")
    fields = relationship("Field", back_populates="version", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="form_version_rel", cascade="all, delete-orphan")


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    formversion = Column(Integer, ForeignKey("form_versions.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(255), nullable=False)
    field_name = Column(String(100), nullable=False)
    field_type = Column(String(50), nullable=False)  # text, number, email, dropdown, checkboxes, date, file_upload, rating
    placeholder = Column(String(255), nullable=True)
    required = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    validation_conf = Column(JSON, nullable=True)
    createdat = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedat = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    version = relationship("FormVersion", back_populates="fields")
    options = relationship("FieldOption", back_populates="field", cascade="all, delete-orphan")
    response_values = relationship("ResponseValue", back_populates="field", cascade="all, delete-orphan")

    trigger_rules = relationship(
        "ConditionalRule", 
        foreign_keys="[ConditionalRule.trigger_field]", 
        back_populates="trigger_field_rel",
        cascade="all, delete-orphan"
    )
    targeted_rules = relationship(
        "ConditionalRule", 
        foreign_keys="[ConditionalRule.targeted_field]", 
        back_populates="targeted_field_rel",
        cascade="all, delete-orphan"
    )


class FieldOption(Base):
    __tablename__ = "field_options"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    optiontext = Column(String(255), nullable=False)
    value = Column(String(255), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    # Relationships
    field = relationship("Field", back_populates="options")


class ConditionalRule(Base):
    __tablename__ = "conditional_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trigger_field = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    operator = Column(String(50), nullable=False)
    comparison = Column(String(255), nullable=True)
    targeted_field = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(50), nullable=False)
    logical_group = Column(String(50), nullable=True)

    # Relationships
    trigger_field_rel = relationship("Field", foreign_keys=[trigger_field], back_populates="trigger_rules")
    targeted_field_rel = relationship("Field", foreign_keys=[targeted_field], back_populates="targeted_rules")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    form_version = Column(Integer, ForeignKey("form_versions.id", ondelete="CASCADE"), nullable=False)
    submission_id = Column(String(255), unique=True, index=True, nullable=False)
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="started", nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    form_version_rel = relationship("FormVersion", back_populates="submissions")
    submitted_by_user = relationship("User", back_populates="submissions")
    response_values = relationship("ResponseValue", back_populates="submission", cascade="all, delete-orphan")


class ResponseValue(Base):
    __tablename__ = "response_values"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    value = Column(Text, nullable=True)
    uploaded_file = Column(Integer, ForeignKey("uploaded_files.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    submission = relationship("Submission", back_populates="response_values")
    field = relationship("Field", back_populates="response_values")
    file_rel = relationship("UploadedFile", back_populates="response_rel")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    response_rel = relationship("ResponseValue", back_populates="file_rel")


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    token = Column(String(512), unique=True, index=True, nullable=False)
    revoked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

