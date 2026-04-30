import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  FileText,
  ListChecks,
  Save,
  Link2,
} from 'lucide-react';
import FormInput from '../components/FormInput';
import Textarea from '../components/Textarea';
import Select from '../components/Select';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { eventService } from '../services/eventService.js';
import { eventFormService } from '../services/eventFormService.js';

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function fieldKey(id) {
  return id === null || id === undefined ? '' : String(id);
}

function isFieldRequired(field) {
  return Number(field?.is_required) === 1;
}

function parseOptions(value) {
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function EventFormBuilder() {
  const { eventId, formId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    loadData();
  }, [eventId, formId]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      // Load event
      const eventData = await eventService.find(eventId);
      setEvent(eventData);

      if (formId) {
        // Load existing form
        const formData = await eventFormService.find(formId);
        setForm(formData);
        setFormTitle(formData.title);
        setFormDescription(formData.description);
        setFields(formData.fields || []);
      } else {
        // New form
        setFormTitle('');
        setFormDescription('');
        setFields([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveForm() {
    if (!formTitle.trim()) {
      setError('Form title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (formId) {
        await eventFormService.update(formId, {
          title: formTitle,
          description: formDescription,
        });
      } else {
        const newForm = await eventFormService.create({
          event_id: eventId,
          title: formTitle,
          description: formDescription,
        });
        navigate(`/admin/events/${eventId}/form/${newForm.id}`, { replace: true });
        setForm(newForm);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddField() {
    const fieldType = 'text';
    try {
      const newField = await eventFormService.addField(formId, {
        field_type: fieldType,
        label: `Question ${fields.length + 1}`,
        is_required: 0,
      });
      setFields([...fields, newField]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateField(index, updates) {
    try {
      const field = fields[index];
      const updated = await eventFormService.updateField(formId, field.id, {
        field_type: hasOwn(updates, 'field_type') ? updates.field_type : field.field_type,
        label: hasOwn(updates, 'label') ? updates.label : field.label,
        placeholder: hasOwn(updates, 'placeholder') ? updates.placeholder : field.placeholder,
        options: hasOwn(updates, 'options') ? updates.options : parseOptions(field.options),
        is_required: hasOwn(updates, 'is_required') ? updates.is_required : field.is_required,
        help_text: hasOwn(updates, 'help_text') ? updates.help_text : field.help_text,
        conditional_parent_field_id: hasOwn(updates, 'conditional_parent_field_id')
          ? updates.conditional_parent_field_id
          : field.conditional_parent_field_id,
        conditional_parent_value: hasOwn(updates, 'conditional_parent_value')
          ? updates.conditional_parent_value
          : field.conditional_parent_value,
      });
      const newFields = [...fields];
      newFields[index] = updated;
      setFields(newFields);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteField(index) {
    try {
      const field = fields[index];
      await eventFormService.deleteField(formId, field.id);
      setFields(fields.filter((_, i) => i !== index));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReorderFields(fromIndex, toIndex) {
    const newFields = [...fields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    setFields(newFields);

    try {
      await eventFormService.updateFieldsOrder(
        formId,
        newFields.map((f) => ({ id: f.id }))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDragStart(index) {
    setDraggedIndex(index);
  }

  function handleDragOver(index) {
    if (draggedIndex === null || draggedIndex === index) return;
    handleReorderFields(draggedIndex, index);
    setDraggedIndex(index);
  }

  if (loading) {
    return <LoadingState message="Loading form..." />;
  }

  if (error && !form && !formId) {
    return <ErrorState message={error} />;
  }

  return (
    <section className="admin-page admin-form-studio-page">
      <div className="admin-panel admin-form-studio-hero">
        <div>
          <span className="admin-kicker">Registration Builder</span>
          <h2>{formId ? 'Edit Event Form' : 'Create Event Form'}</h2>
          <p className="admin-subtitle-text">
            {event ? `Design the join form for ${event.title}.` : 'Design the event registration form.'}
          </p>
        </div>
        <button
          className="admin-button admin-button-secondary"
          type="button"
          onClick={() => navigate(`/admin/events/edit/${eventId}`)}
        >
          <ArrowLeft size={17} />
          Back to Event
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-form-studio-layout">
        <aside className="admin-form-studio-sidebar">
          <section className="admin-panel admin-form-details-panel">
            <div className="admin-editor-section-head">
              <span className="admin-editor-section-icon"><FileText size={18} /></span>
              <div>
                <h3>Form details</h3>
                <p>Name and explain what members are signing up for.</p>
              </div>
            </div>

            <FormInput
              label="Form Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enter form title"
              required
            />
            <Textarea
              label="Form Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional description for your form"
            />
            <button
              className="admin-button admin-button-primary"
              type="button"
              onClick={handleSaveForm}
              disabled={saving}
            >
              <Save size={17} />
              {saving ? 'Saving...' : 'Save Form'}
            </button>
          </section>

          <section className="admin-panel admin-form-studio-summary">
            <span className="admin-editor-section-icon"><ListChecks size={18} /></span>
            <h3>Form health</h3>
            <div className="admin-form-health-grid">
              <div>
                <strong>{fields.length}</strong>
                <span>Fields</span>
              </div>
              <div>
                <strong>{fields.filter((field) => Number(field.is_required) === 1).length}</strong>
                <span>Required</span>
              </div>
            </div>
            <p>
              Keep forms short and clear. Ask only for details the event team will actually use.
            </p>
          </section>
        </aside>

        <section className="admin-panel admin-form-builder-canvas">
          <div className="admin-form-builder-canvas-head">
            <div>
              <span className="admin-kicker">Questions</span>
              <h3>Form fields</h3>
              <p>{formId ? 'Add, edit, and reorder questions for this registration form.' : 'Save form details before adding questions.'}</p>
            </div>
            {formId && (
              <button className="admin-button admin-button-primary" type="button" onClick={handleAddField}>
                <Plus size={18} />
                Add Field
              </button>
            )}
          </div>

          {!formId ? (
            <div className="admin-state admin-form-builder-empty">
              <CheckCircle2 size={34} />
              <h3>Start with form details</h3>
              <p>Enter a form title and save it. The question builder will unlock right after.</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="admin-state admin-form-builder-empty">
              <ListChecks size={34} />
              <h3>No fields yet</h3>
              <p>Add the first question to start building the registration experience.</p>
              <button className="admin-button admin-button-primary" type="button" onClick={handleAddField}>
                <Plus size={18} />
                Add Field
              </button>
            </div>
          ) : (
            <div className="form-fields-list">
              {fields.map((field, index) => (
                <FormFieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  allFields={fields}
                  onUpdate={(updates) => handleUpdateField(index, updates)}
                  onDelete={() => handleDeleteField(index)}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={() => handleDragOver(index)}
                  isDragged={draggedIndex === index}
                />
              ))}
            </div>
          )}

          {formId && (
            <div className="admin-form-builder-footer">
              <button
                className="admin-button admin-button-secondary"
                type="button"
                onClick={() => navigate(`/admin/events/${eventId}/form/${formId}/responses`)}
              >
                <FileText size={17} />
                View Responses
              </button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function FormFieldEditor({
  field,
  index,
  allFields,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  isDragged,
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const [label, setLabel] = useState(field.label);
  const [fieldType, setFieldType] = useState(field.field_type);
  const [placeholder, setPlaceholder] = useState(field.placeholder || '');
  const [isRequired, setIsRequired] = useState(isFieldRequired(field));
  const [helpText, setHelpText] = useState(field.help_text || '');
  const [conditionalParentId, setConditionalParentId] = useState(fieldKey(field.conditional_parent_field_id));
  const [conditionalParentValue, setConditionalParentValue] = useState(field.conditional_parent_value || '');
  const [options, setOptions] = useState(() => parseOptions(field.options));
  const [optionInput, setOptionInput] = useState('');

  const fieldTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'tel', label: 'Phone' },
    { value: 'url', label: 'Website URL' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
  ];

  function handleTypeChange(newType) {
    setFieldType(newType);
    onUpdate({ field_type: newType });
  }

  function handleLabelChange(e) {
    setLabel(e.target.value);
    onUpdate({ label: e.target.value });
  }

  function handlePlaceholderChange(e) {
    setPlaceholder(e.target.value);
    onUpdate({ placeholder: e.target.value });
  }

  function handleRequiredChange(e) {
    setIsRequired(e.target.checked);
    onUpdate({ is_required: e.target.checked ? 1 : 0 });
  }

  function handleHelpTextChange(e) {
    setHelpText(e.target.value);
    onUpdate({ help_text: e.target.value });
  }

  function handleConditionalParentChange(e) {
    const parentId = e.target.value;
    setConditionalParentId(parentId);
    setConditionalParentValue('');
    // Only save if clearing the condition
    if (!parentId) {
      onUpdate({
        conditional_parent_field_id: null,
        conditional_parent_value: '',
      });
    }
    // If setting a parent, wait for user to also select a value
  }

  function handleConditionalValueChange(e) {
    const value = e.target.value;
    setConditionalParentValue(value);
    // Only save both fields together when value is selected
    if (conditionalParentId && value) {
      onUpdate({
        conditional_parent_field_id: Number(conditionalParentId),
        conditional_parent_value: value,
      });
    }
  }
  function handleAddOption() {
    if (optionInput.trim()) {
      const newOptions = [...options, optionInput.trim()];
      setOptions(newOptions);
      setOptionInput('');
      onUpdate({ options: newOptions });
    }
  }

  function handleRemoveOption(optIndex) {
    const newOptions = options.filter((_, i) => i !== optIndex);
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  }

  // Find parent field to show available options
  const parentField = conditionalParentId ? allFields.find((f) => fieldKey(f.id) === conditionalParentId) : null;
  const parentOptions = parentField ? parseOptions(parentField.options) : [];

  const showOptions = ['select', 'radio', 'checkbox'].includes(fieldType);
  const showPlaceholder = ['text', 'email', 'number', 'tel', 'url', 'textarea'].includes(fieldType);

  return (
    <div
      className={`form-field-editor ${isDragged ? 'dragging' : ''}`}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      draggable
    >
      <div className="form-field-header">
        <div className="form-field-title" onClick={() => setExpanded(!expanded)}>
          <GripVertical size={18} className="drag-handle" />
          <span>{label || 'Untitled Question'}</span>
          <ChevronDown size={18} className={expanded ? 'expanded' : ''} />
        </div>
        <button className="admin-icon-button danger" type="button" onClick={onDelete} aria-label="Delete field">
          <Trash2 size={18} />
        </button>
      </div>

      {expanded && (
        <div className="form-field-content">
          <FormInput
            label="Question Label"
            value={label}
            onChange={handleLabelChange}
            placeholder="Enter question"
          />

          <Select
            label="Field Type"
            value={fieldType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          {showPlaceholder && (
            <FormInput
              label="Placeholder Text"
              value={placeholder}
              onChange={handlePlaceholderChange}
              placeholder="Enter placeholder text"
            />
          )}

          <label className="admin-builder-checkbox">
            <input type="checkbox" checked={isRequired} onChange={handleRequiredChange} />
            Required Field
          </label>

          <FormInput
            label="Help Text"
            value={helpText}
            onChange={handleHelpTextChange}
            placeholder="Optional help text for users"
          />

          {showOptions && (
            <div className="form-field-options">
              <label>Options</label>
              <div className="options-input-group">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="Type an option and press Add"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <button className="admin-button admin-button-secondary" type="button" onClick={handleAddOption}>
                  Add
                </button>
              </div>

              {options.length > 0 && (
                <div className="options-list">
                  {options.map((option, idx) => (
                    <div key={idx} className="option-item">
                      <span>{option}</span>
                      <button
                        className="admin-icon-button danger"
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        aria-label={`Remove ${option}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <fieldset style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '12px', marginTop: '16px' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', paddingInline: '6px' }}>
              <Link2 size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
              Conditional Logic
            </legend>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBlock: '8px' }}>
              Show this question only when user selects a specific option in another question.
            </p>
            <Select
              label="Parent Question (optional)"
              value={conditionalParentId || ''}
              onChange={handleConditionalParentChange}
            >
              <option value="">-- No condition --</option>
              {allFields.map((f) => {
                const isSelectLike = ['radio', 'select', 'checkbox'].includes(f.field_type);
                const isNotSelf = fieldKey(f.id) !== fieldKey(field.id);
                if (isSelectLike && isNotSelf) {
                  return (
                    <option key={f.id} value={fieldKey(f.id)}>
                      {f.label}
                    </option>
                  );
                }
                return null;
              })}
            </Select>

            {conditionalParentId && parentOptions.length > 0 && (
              <Select
                label="Show when option is selected"
                value={conditionalParentValue || ''}
                onChange={handleConditionalValueChange}
              >
                <option value="">-- Select option --</option>
                {parentOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            )}
          </fieldset>
        </div>
      )}
    </div>
  );
}
