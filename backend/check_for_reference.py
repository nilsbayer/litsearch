from transformers import pipeline

classifier = pipeline("zero-shot-classification")

list_of_samples = ["This paper attempts to explain international trends and differences in subjective well- being over the final fifth of the twentieth century.", "This will be done in several stages.", "First there will be a brief review of some reasons for giving a central role to subjective measures of well-being.", "This will be followed by sections containing a survey of earlier empirical studies, a description of the main variables used in this study, a report of results and tests, discussion of the links among social capital, education, and well-being, re-estimation of the final model,and 1 Department of Economics, University of British Columbia"]

print(classifier(list_of_samples, ["reference", "not a reference"]))