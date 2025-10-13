import React, { useState } from 'react';

function SafetyReportForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    subLocation: '',
    description: '',
    actionsTaken: '',
    observerName: '',
    observerEmail: '',
    photo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="safety-form">
      <h2>Report Safety Issue</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type of Issue *</label>
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="">Select type...</option>
            <option value="Near Miss">Near Miss</option>
            <option value="Safety Hazard">Safety Hazard</option>
            <option value="Unsafe Condition">Unsafe Condition</option>
            <option value="Unsafe Act">Unsafe Act</option>
            <option value="Incident">Incident</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location *</label>
          <select name="location" value={formData.location} onChange={handleChange} required>
            <option value="">Select location...</option>
            <option value="Lab 1">Lab 1</option>
            <option value="Lab 2">Lab 2</option>
            <option value="Lab 3">Lab 3</option>
            <option value="Lab 4">Lab 4</option>
            <option value="Common Area">Common Area</option>
            <option value="Powder Room">Powder Room</option>
            <option value="Storage">Storage</option>
            <option value="Office">Office</option>
          </select>
        </div>

        <div className="form-group">
          <label>Specific Location</label>
          <input
            type="text"
            name="subLocation"
            value={formData.subLocation}
            onChange={handleChange}
            placeholder="e.g., Fume hood #3, Bench 2"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe the safety issue in detail..."
          />
        </div>

        <div className="form-group">
          <label>Actions Taken</label>
          <textarea
            name="actionsTaken"
            value={formData.actionsTaken}
            onChange={handleChange}
            rows="3"
            placeholder="What immediate actions were taken?"
          />
        </div>

        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            name="observerName"
            value={formData.observerName}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label>Your Email</label>
          <input
            type="email"
            name="observerEmail"
            value={formData.observerEmail}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label>Photo Evidence</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-btn">Submit Report</button>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default SafetyReportForm;