# Forms
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from flask_wtf.file import FileAllowed, FileRequired, FileField
from wtforms.fields import MultipleFileField, TextAreaField
from wtforms.validators import DataRequired, Length, ValidationError, EqualTo, Email

class FileUploadForm(FlaskForm):
    files = MultipleFileField('PDF', validators=[FileAllowed(["pdf"], 'PDFs only!')])
    submit = SubmitField("Analyze PDF")

class SubjectSearchForm(FlaskForm):
    search = StringField('Search subject', validators=[DataRequired()])

class SurveyCreationForm(FlaskForm):
    name = StringField('Project name', validators=[DataRequired()])
    description = TextAreaField('Project description')
    submit = SubmitField("Create")