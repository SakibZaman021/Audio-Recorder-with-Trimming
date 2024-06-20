import React from 'react';

const ConfirmationModal = ({ show, onClose, onYesClick }) => {
  return (
    <div className="modal-overlay" style={{ display: show ? 'flex' : 'none' }}>
      <div className="modal">
        <div className="modal-header">
          <h5>Start Recording?</h5>
          {/* <button className="close-btn" onClick={onClose}></button> */}
        </div>
        <div className="modal-body">
          <p>Recording will happen continuously</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>No</button>
          <button className="btn btn-primary" onClick={onYesClick}>Yes</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
