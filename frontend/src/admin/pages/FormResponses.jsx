import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clipboard,
  Download,
  Eye,
  FileText,
  Mail,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { eventFormService } from '../services/eventFormService.js';

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleString();
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function getInitial(name, email) {
  return (name || email || 'A').charAt(0).toUpperCase();
}

function parseSummary(summary = '') {
  if (!summary) return [];

  return String(summary)
    .split(' | ')
    .map((pair) => {
      const separator = pair.indexOf(':');
      if (separator === -1) {
        return { field_label: pair.trim(), answer: '' };
      }

      return {
        field_label: pair.substring(0, separator).trim(),
        answer: pair.substring(separator + 1).trim(),
      };
    })
    .filter((answer) => answer.field_label);
}

function normalizeAnswers(response) {
  if (Array.isArray(response?.answers) && response.answers.length > 0) {
    return response.answers.map((answer) => ({
      field_label: answer.field_label || answer.label || 'Question',
      answer: Array.isArray(answer.answer) ? answer.answer.join(', ') : (answer.answer ?? ''),
    }));
  }

  return parseSummary(response?.response_summary);
}

function answerMap(response) {
  return normalizeAnswers(response).reduce((map, answer) => {
    map[answer.field_label] = answer.answer;
    return map;
  }, {});
}

export default function FormResponses() {
  const { eventId, formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadData();
  }, [formId]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      setNotice('');

      const [formData, responsesData] = await Promise.all([
        eventFormService.find(formId),
        eventFormService.getResponses(formId),
      ]);

      setForm(formData);
      setResponses(responsesData);
    } catch (err) {
      setError(err.message || 'Unable to load responses.');
    } finally {
      setLoading(false);
    }
  }

  const filteredResponses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return responses;

    return responses.filter((response) => {
      const haystack = [
        response.responder_name,
        response.responder_email,
        response.response_summary,
        response.created_at,
      ].join(' ').toLowerCase();

      return haystack.includes(term);
    });
  }, [responses, search]);

  const fieldLabels = useMemo(() => {
    const labels = new Set((form?.fields || []).map((field) => field.label).filter(Boolean));
    responses.forEach((response) => {
      normalizeAnswers(response).forEach((answer) => labels.add(answer.field_label));
    });
    return Array.from(labels);
  }, [form?.fields, responses]);

  const latestResponse = responses[0] || null;
  const totalAnswerCount = responses.reduce((total, response) => total + normalizeAnswers(response).length, 0);

  async function handleDeleteResponse(responseId, { confirm = true } = {}) {
    if (confirm && !window.confirm('Delete this response? This action cannot be undone.')) return false;

    setDeletingId(responseId);
    setError('');
    setNotice('');

    try {
      await eventFormService.deleteResponse(formId, responseId);
      setResponses((current) => current.filter((response) => response.id !== responseId));
      setSelectedResponse((current) => (current?.id === responseId ? null : current));
      setNotice('Response deleted successfully.');
      return true;
    } catch (err) {
      setError(`Failed to delete response: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  async function handleViewResponse(response) {
    setError('');
    setLoadingResponse(true);
    setSelectedResponse({
      ...response,
      answers: normalizeAnswers(response),
      detailWarning: '',
    });

    try {
      const fullResponse = await eventFormService.getResponseDetail(formId, response.id);
      setSelectedResponse({
        ...response,
        ...fullResponse,
        answers: normalizeAnswers(fullResponse).length > 0 ? normalizeAnswers(fullResponse) : normalizeAnswers(response),
        detailWarning: '',
      });
    } catch (err) {
      setSelectedResponse((current) => ({
        ...current,
        detailWarning: `Full details could not be loaded, so this preview is using the saved response summary. ${err.message || ''}`.trim(),
      }));
    } finally {
      setLoadingResponse(false);
    }
  }

  async function handleExportExcel() {
    if (responses.length === 0) {
      alert('No responses to export');
      return;
    }

    const XLSX = await import('xlsx');
    const excelData = responses.map((response) => {
      const answers = answerMap(response);
      const row = {
        'Responder Name': response.responder_name || 'Anonymous',
        Email: response.responder_email || 'N/A',
        'Submitted At': formatDateTime(response.created_at),
      };

      fieldLabels.forEach((label) => {
        row[label] = answers[label] || '';
      });

      return row;
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 25 },
      ...fieldLabels.map(() => ({ wch: 28 })),
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
    XLSX.writeFile(workbook, `form-responses-${form?.title || formId}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  function handleExportCSV() {
    if (responses.length === 0) {
      alert('No responses to export');
      return;
    }

    const headers = ['Responder Name', 'Email', 'Submitted At', ...fieldLabels];
    const csvContent = [
      headers.map(csvCell).join(','),
      ...responses.map((response) => {
        const answers = answerMap(response);
        return [
          response.responder_name || 'Anonymous',
          response.responder_email || 'N/A',
          formatDateTime(response.created_at),
          ...fieldLabels.map((label) => answers[label] || ''),
        ].map(csvCell).join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-responses-${formId}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  if (loading) {
    return <LoadingState message="Loading responses..." />;
  }

  if (error && !form) {
    return <ErrorState message={error} />;
  }

  return (
    <section className="admin-page admin-responses-page">
      <div className="admin-panel admin-responses-hero">
        <div>
          <span className="admin-kicker">Event Responses</span>
          <h2>{form?.title || 'Form Responses'}</h2>
          <p className="admin-subtitle-text">
            Review submitted registrations, inspect individual answers, and export clean response data.
          </p>
        </div>
        <button
          className="admin-button admin-button-secondary"
          type="button"
          onClick={() => navigate(`/admin/events/${eventId}/form/${formId}`)}
        >
          <ArrowLeft size={17} />
          Back to Form
        </button>
      </div>

      <div className="admin-response-stats">
        <div className="admin-response-stat">
          <span className="admin-event-stat-icon"><UserRound size={18} /></span>
          <div>
            <strong>{responses.length}</strong>
            <small>Total Responses</small>
          </div>
        </div>
        <div className="admin-response-stat">
          <span className="admin-event-stat-icon"><FileText size={18} /></span>
          <div>
            <strong>{fieldLabels.length}</strong>
            <small>Question Fields</small>
          </div>
        </div>
        <div className="admin-response-stat">
          <span className="admin-event-stat-icon"><Clipboard size={18} /></span>
          <div>
            <strong>{totalAnswerCount}</strong>
            <small>Recorded Answers</small>
          </div>
        </div>
        <div className="admin-response-stat">
          <span className="admin-event-stat-icon"><Calendar size={18} /></span>
          <div>
            <strong>{latestResponse ? new Date(latestResponse.created_at).toLocaleDateString() : '—'}</strong>
            <small>Latest Submit</small>
          </div>
        </div>
      </div>

      {form?.description && (
        <div className="form-description-box">
          <p>{form.description}</p>
        </div>
      )}

      {notice && <div className="admin-alert">{notice}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-panel admin-responses-workspace">
        <div className="admin-responses-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, answers, or date..."
            />
          </label>

          <div className="admin-actions-group">
            <button className="admin-button admin-button-primary" type="button" onClick={handleExportExcel}>
              <Download size={17} />
              Export Excel
            </button>
            <button className="admin-button admin-button-secondary" type="button" onClick={handleExportCSV}>
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>

        {filteredResponses.length === 0 ? (
          <EmptyState title={responses.length === 0 ? 'No responses yet' : 'No responses matched your search'} />
        ) : (
          <div className="responses-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Responder</th>
                  <th>Email</th>
                  <th>Submitted</th>
                  <th>Answers</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((response) => {
                  const answers = normalizeAnswers(response);

                  return (
                    <tr key={response.id} className="response-row">
                      <td>
                        <div className="response-name">
                          <div className="avatar-placeholder">{getInitial(response.responder_name, response.responder_email)}</div>
                          <div>
                            <strong>{response.responder_name || 'Anonymous'}</strong>
                            <small>Response #{response.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="response-email">
                          <Mail size={14} />
                          <span>{response.responder_email || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="response-date">
                          <Calendar size={14} />
                          <span>{formatDateTime(response.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-response-count">{answers.length} answer{answers.length === 1 ? '' : 's'}</span>
                      </td>
                      <td className="text-right">
                        <div className="admin-row-actions admin-row-actions-right">
                          <button
                            className="admin-icon-button"
                            type="button"
                            onClick={() => handleViewResponse(response)}
                            title="View response"
                            aria-label="View response"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="admin-icon-button danger"
                            type="button"
                            onClick={() => handleDeleteResponse(response.id)}
                            disabled={deletingId === response.id}
                            title="Delete response"
                            aria-label="Delete response"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedResponse && (
        <ResponseDetailsModal
          response={selectedResponse}
          loading={loadingResponse}
          deleting={deletingId === selectedResponse.id}
          onClose={() => setSelectedResponse(null)}
          onDelete={() => handleDeleteResponse(selectedResponse.id, { confirm: true })}
        />
      )}
    </section>
  );
}

function ResponseDetailsModal({ response, loading, deleting, onClose, onDelete }) {
  const answers = normalizeAnswers(response);

  function copyAnswers() {
    const lines = [
      `Name: ${response.responder_name || 'Anonymous'}`,
      `Email: ${response.responder_email || 'N/A'}`,
      `Submitted: ${formatDateTime(response.created_at)}`,
      ...answers.map((answer) => `${answer.field_label}: ${answer.answer || '(No answer provided)'}`),
    ];

    navigator.clipboard?.writeText(lines.join('\n'));
  }

  function exportSingleCSV() {
    const csv = [
      ['Field', 'Answer'].map(csvCell).join(','),
      ...answers.map((answer) => [answer.field_label, answer.answer || ''].map(csvCell).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response-${response.id || 'detail'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-overlay response-modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel response-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header modal-header-rich">
          <div>
            <span className="admin-kicker">Response Details</span>
            <h2>{response.responder_name || 'Anonymous'}</h2>
            <p className="modal-subtitle">{response.responder_email || 'No email provided'}</p>
          </div>

          <div className="modal-actions">
            <button className="admin-button admin-button-secondary" type="button" onClick={copyAnswers}>
              Copy
            </button>
            <button className="admin-button admin-button-secondary" type="button" onClick={exportSingleCSV}>
              Export
            </button>
            <button className="admin-icon-button" type="button" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>

        <div className="modal-body">
          {loading && <div className="admin-inline-note">Loading full response details...</div>}
          {response.detailWarning && <div className="admin-alert admin-alert-warning">{response.detailWarning}</div>}

          <div className="response-info-grid">
            <div>
              <span>Name</span>
              <strong>{response.responder_name || 'Anonymous'}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{response.responder_email || 'N/A'}</strong>
            </div>
            <div>
              <span>Submitted</span>
              <strong>{formatDateTime(response.created_at)}</strong>
            </div>
            {response.ip_address && (
              <div>
                <span>IP Address</span>
                <strong>{response.ip_address}</strong>
              </div>
            )}
          </div>

          <section className="response-answers-section">
            <h3>Answers</h3>
            {answers.length > 0 ? (
              <div className="answers-grid">
                {answers.map((answer, index) => (
                  <article className="answer-grid-item" key={`${answer.field_label}-${index}`}>
                    <label className="answer-grid-label">{answer.field_label}</label>
                    <div className="answer-grid-value">
                      {answer.answer ? <p>{answer.answer}</p> : <p className="text-muted">(No answer provided)</p>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-state admin-response-empty">
                <h3>No answers recorded</h3>
                <p>This response did not include any form answers.</p>
              </div>
            )}
          </section>
        </div>

        <div className="modal-footer">
          <button className="admin-button admin-button-danger" type="button" onClick={onDelete} disabled={deleting}>
            <Trash2 size={17} />
            {deleting ? 'Deleting...' : 'Delete Response'}
          </button>
          <button className="admin-button admin-button-primary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
