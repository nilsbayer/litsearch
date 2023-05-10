# Forms
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from flask_wtf.file import FileAllowed, FileRequired, FileField
from wtforms.fields import MultipleFileField, TextAreaField, PasswordField, HiddenField
from wtforms.validators import DataRequired, Length, ValidationError, EqualTo, Email
from app import users_col

class SignUpForm(FlaskForm):
    package = HiddenField('Package', validators=[DataRequired()])
    full_name = StringField('Your full name', validators=[DataRequired()])
    email = StringField('Your lovely email', validators=[DataRequired(), Email()])
    password = PasswordField("Choose a safely chosen password", validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm your password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Signup')

class LoginForm(FlaskForm):
    email = StringField('Your lovely email', validators=[DataRequired(), Email()])
    password = PasswordField("Your safely chosen password", validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Login')

class FileUploadForm(FlaskForm):
    files = MultipleFileField('PDF', validators=[FileAllowed(["pdf"], 'PDFs only!')])
    submit = SubmitField("Analyze PDF")

class SubjectSearchForm(FlaskForm):
    search = StringField('Search subject', validators=[DataRequired()])

class SurveyCreationForm(FlaskForm):
    name = StringField('Project name', validators=[DataRequired()])
    description = TextAreaField('Project description')
    submit = SubmitField("Create")