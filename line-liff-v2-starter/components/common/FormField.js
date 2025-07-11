import {
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { calculateAge } from '../../utils/dateUtils';
import dayjs from 'dayjs';

export default function FormField({ field, value, onChange, section, formData }) {
  const fieldId = section ? `${section}.${field.id}` : field.id;

  const handleChange = (newValue) => {
    onChange(fieldId, newValue);
  };

  const handleMultiSelectChange = (option, checked) => {
    const currentValue = value || [];
    const newValue = checked
      ? [...currentValue, option]
      : currentValue.filter(item => item !== option);
    handleChange(newValue);
  };

  switch (field.type) {
    case 'text':
      return (
        <TextField
          fullWidth
          label={field.label}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
        />
      );

    case 'number':
      return (
        <TextField
          fullWidth
          label={field.label}
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          inputProps={{
            min: field.min,
            max: field.max === 'currentYear' ? new Date().getFullYear() : field.max
          }}
        />
      );

    case 'date':
      return (
        <Box>
          <DatePicker
            label={field.label}
            value={value ? dayjs(value) : null}
            onChange={(date) => handleChange(date)}
            slotProps={{ textField: { fullWidth: true, required: field.required } }}
          />
          {field.autoCalculate === 'age' && value && (
            <TextField
              fullWidth
              label="年齢"
              value={calculateAge(value) || ''}
              disabled
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      );

    case 'time':
      return (
        <TextField
          fullWidth
          label={field.label}
          type="time"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth required={field.required}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
          >
            {field.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case 'multiSelect':
      return (
        <Box>
          <FormLabel component="legend">{field.label}</FormLabel>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {field.options.map(option => (
              <Chip
                key={option}
                label={option}
                clickable
                color={(value || []).includes(option) ? 'primary' : 'default'}
                onClick={() => handleMultiSelectChange(option, !(value || []).includes(option))}
              />
            ))}
          </Box>
        </Box>
      );

    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
            />
          }
          label={field.label}
        />
      );

    case 'hidden':
      return null;

    default:
      return null;
  }
}