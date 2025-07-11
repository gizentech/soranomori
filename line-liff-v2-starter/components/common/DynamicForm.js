import { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import FormField from './FormField';
import questionnaireData from '../../data/questionnaire.json';

export default function DynamicForm({ formData, setFormData }) {
  const [conditionalFields, setConditionalFields] = useState({});

  useEffect(() => {
    // 条件分岐の処理
    const newConditionalFields = {};
    
    // 婚姻状況による条件分岐
    if (formData.maritalStatus === '既婚') {
      newConditionalFields.marriageYear = true;
    }
    
    // 不妊治療による条件分岐
    if (formData.treatmentDesires?.infertility) {
      newConditionalFields.infertilityOptions = true;
    }
    
    setConditionalFields(newConditionalFields);
  }, [formData]);

  const handleFieldChange = (fieldPath, value) => {
    const keys = fieldPath.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const renderTreatmentDesires = () => {
    const treatmentData = questionnaireData.treatmentDesires;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {treatmentData.title}
        </Typography>
        
        {treatmentData.questions.map(question => (
          <Box key={question.id} sx={{ mb: 2 }}>
            <FormField
              field={{
                id: question.id,
                label: question.label,
                type: 'checkbox'
              }}
              value={formData.treatmentDesires?.[question.id]}
              onChange={handleFieldChange}
              section="treatmentDesires"
              formData={formData}
            />
            
            {question.hasSubQuestions && formData.treatmentDesires?.[question.id] && (
              <Box sx={{ ml: 4, mt: 1 }}>
                {question.subQuestions.map(subQuestion => (
                  <FormField
                    key={subQuestion.id}
                    field={{
                      id: subQuestion.id,
                      label: subQuestion.label,
                      type: 'checkbox'
                    }}
                    value={formData.treatmentDesires?.[subQuestion.id]}
                    onChange={handleFieldChange}
                    section="treatmentDesires"
                    formData={formData}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const renderMaritalStatus = () => {
    const maritalData = questionnaireData.maritalStatus;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormField
              field={{
                id: 'maritalStatus',
                label: maritalData.title,
                type: 'select',
                options: maritalData.options,
                required: true
              }}
              value={formData.maritalStatus}
              onChange={handleFieldChange}
              formData={formData}
            />
          </Grid>
          
          {conditionalFields.marriageYear && (
            <Grid item xs={12} sm={6}>
              <FormField
                field={maritalData.conditionalFields['既婚'][0]}
                value={formData.marriageYear}
                onChange={handleFieldChange}
                formData={formData}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderPersonalInfo = (personType) => {
    const personData = questionnaireData.personalInfo[personType];
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {personData.title}
        </Typography>
        
        <Grid container spacing={3}>
          {personData.fields.map(field => (
            <Grid item xs={12} sm={field.type === 'date' ? 6 : field.type === 'time' ? 3 : 6} key={field.id}>
              <FormField
                field={field}
                value={formData[personType]?.[field.id]}
                onChange={handleFieldChange}
                section={personType}
                formData={formData}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {renderTreatmentDesires()}
      {renderMaritalStatus()}
      {renderPersonalInfo('wife')}
      {renderPersonalInfo('husband')}
    </Box>
  );
}