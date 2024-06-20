import { useEffect, useState } from 'react';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { Form } from 'react-router-dom';
import { toast } from 'react-toastify';
import RecordingIndicator from '../components/RecordingIndicator.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';

const AddRecord = () => {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [prescription, setPrescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [startingTime, setStartingTime] = useState(new Date().toLocaleTimeString());
  const [endingTime, setEndingTime] = useState('');
  const [prescriptionSegments, setPrescriptionSegments] = useState([]);
  const [continuousRecordingIsHappening, setContinuousRecordingIsHappening] = useState(false)
  const [takingToAPatient, setTakingToAPatient] = useState(false)
  const [individualPatientTakingTimeStampClock, setIndividualPatientTakingTimeStampClock] = useState("")



  
  
  const serverAudioReceiverBaseUrl = 'http://localhost:9999';
  const serverAudioReceiverUrl = serverAudioReceiverBaseUrl + '/upload-audio/';

  




  // stop watch
  var startTime; // to keep track of the start time
  var stopwatchInterval; // to keep track of the interval
  var elapsedPausedTime = 0; // to keep track of the elapsed time while stopped
  const [currentStopWatchTimeStamp, setCurrentStopWatchTimeStamp] = useState('')
  const [audioCropTimeStamp, setAudioCropTimeStamp] = useState([])

  function startStopwatch() {
    if (!continuousRecordingIsHappening) {
      startTime = new Date().getTime() - elapsedPausedTime; // get the starting time by subtracting the elapsed paused time from the current time
      stopwatchInterval = setInterval(updateStopwatch, 1000); // update every second
      setAudioCropTimeStamp(prevList => [...prevList, "00:00:00"]);
      setContinuousRecordingIsHappening(true);
    }
  }

  function stopStopwatch() {
    clearInterval(stopwatchInterval); // stop the interval
    elapsedPausedTime = new Date().getTime() - startTime; // calculate elapsed paused time
    stopwatchInterval = null; // reset the interval variable
  }

  function resetStopwatch() {
    stopStopwatch(); // stop the interval
    elapsedPausedTime = 0; // reset the elapsed paused time variable
  }

  function updateStopwatch() {
    var currentTime = new Date().getTime(); // get current time in milliseconds
    var elapsedTime = currentTime - startTime; // calculate elapsed time in milliseconds
    var seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
    var minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes
    var hours = Math.floor(elapsedTime / 1000 / 60 / 60); // calculate hours
    var displayTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds); // format display time
    setCurrentStopWatchTimeStamp(displayTime)
    // console.log(displayTime)
  }

  function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
  }





  useEffect(() => {
    setPrescription('');
    setAudioCropTimeStamp([])
    setAudioChunks([])
    startTime = null;
    setStartingTime(null);
    // console.log(new Date().toLocaleTimeString());
  }, []);

  function getTimeFormat(timeStamp) {
    const currentTimeString = timeStamp;
    const [timeWithoutSeconds, amOrPm] = currentTimeString.split(' ');
    const [hours, minutes, second] = timeWithoutSeconds.split(':');
    let hours24 = parseInt(hours);
    if (amOrPm.toLowerCase() === 'pm' && hours < 13) hours24 += 12;
    return hours24 + ':' + minutes;
  }

  function getDateFormat() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}:${month}:${day}`;
  }

  function getWavFileName() {
    return (
      // patientId +
      // '_' +
      hospitalId +
      '_' +
      getTimeFormat(startingTime) +
      '_' +
      getTimeFormat(new Date().toLocaleTimeString()) +
      '_' +
      getDateFormat()
    );
  }

  const getMicroPhoneAccess = async () => {
    try {
      setShowModal(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      recorder.start(() => { });
      // setIsRecording(true);
      setContinuousRecordingIsHappening(true)
      setMediaRecorder(recorder);
      toast.success('Recording started...', { autoClose: 1000 });
      // setTimeStamp([{ start: '00:00:00', end: '' }]);
      startStopwatch();
      setStartingTime(new Date().toLocaleTimeString());

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone.');
    }
  };

  const startAudioRecording = async () => {
    setShowModal(true);
  };

  const getNewTimeStamp = () => {
    var croppedFileName = patientId + "_" + hospitalId + "_" + individualPatientTakingTimeStampClock + "_" + getTimeFormat(new Date().toLocaleTimeString()) + "_" + getDateFormat();
    console.log("croppedFileName ", croppedFileName)
    setAudioCropTimeStamp(prevList => [...prevList, currentStopWatchTimeStamp + "#" + croppedFileName]);
    setPatientId('');
    setPatientAge('');
    //setHospitalId('');
    setPatientName('');
    toast.success('New patient timestamp added...', { autoClose: 500 });
  };

  const stopAudioRecording = () => {
    setEndingTime(new Date().toLocaleTimeString());
    // console.log(" -> mediaRecorder", mediaRecorder)
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    toast.success('Recording stopped...', { autoClose: 1000 });
    toast.info("Please do not shut down the device")
    resetStopwatch();

    setContinuousRecordingIsHappening(false);

    var paired = []
    for (var i = 1; i < audioCropTimeStamp.length; i++) {
      var t = audioCropTimeStamp[i];
      var tprev = audioCropTimeStamp[i - 1].split("#")[0];
      var val = tprev + " " + t.split("#")[0] + " " + t.split("#")[1];
      paired.push(val);
    }

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const timeStampBlob = new Blob([paired.join('\n')], { type: 'text/plain' });
    // console.log(audioBlob);
    // console.log(timeStampBlob);
    downloadRecording(audioBlob, timeStampBlob);
    sendAudioToServer(audioBlob, timeStampBlob);
    setAudioChunks([]);
    setAudioCropTimeStamp([]);
  };

  const sendAudioToServer = async (audioBlob, timeStampBlob) => {
    const wavFileName = getWavFileName();
    const formData = new FormData();
    formData.append('audioFile', audioBlob, `${patientId}.wav`);
    formData.append('timeStampTextFile', timeStampBlob, `${getWavFileName()}`.wav);
    try {
      const response = await fetch(serverAudioReceiverUrl + wavFileName, {
        method: 'POST',
        body: formData,
      });
      toast.success('Successfully sent to server', { autoClose: 5000 });
    } catch (error) {
      console.error('Failed to send audio:', error);
    }
  };

  const downloadRecording = async (audioBlob, timeStampBlob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${getWavFileName()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(audioUrl);
    // setAudioChunks([]);
    toast.success(getWavFileName() + ' successfully downloaded', {
      autoClose: 3000,
    });

    const url = window.URL.createObjectURL(timeStampBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTakingToAPatient(false);
    // stopRecording(); // Stop recording and submit the form
  };




  const generateRandomPatientId = () => {
    // Generate a random 6-digit patient ID as a string
    return (100000 + Math.random() * 900000).toFixed(0).toString();
  };

  const generateRandomHospitalId = () => {
    // Generate a random hospital ID with 3-5 uppercase letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const length = Math.floor(3 + Math.random() * 3); // Length between 3 and 5
    let hospitalId = '';
    for (let i = 0; i < length; i++) {
      hospitalId += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return hospitalId;
  };

  const generateRandomName = () => {
    const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  };

  const generatePatientDetails = () => {
    const dummyPatientId = generateRandomPatientId();
    const dummyName = generateRandomName();
    const dummyAge = Math.floor(18 + Math.random() * 83);
    const dummyHospitalId = "AWA";

    setPatientId(dummyPatientId);
    setPatientName(dummyName);
    setPatientAge(dummyAge);
    setHospitalId(dummyHospitalId);
    // startRecording(); // Start recording when generating patient details

    setTakingToAPatient(true);

    setIndividualPatientTakingTimeStampClock(getTimeFormat(new Date().toLocaleTimeString()));
  };


  const handlePrescriptionChange = (event) => {
    setPrescription(event.target.value);
  };

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // setShowModal(true);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };


  return (
    <Wrapper
      className="wrapper"
      style={{ position: 'relative', overflow: 'hidden' }}
    >


      <ConfirmationModal show={showModal} onYesClick={getMicroPhoneAccess} onClose={handleCloseModal} />

      <Form method="post" className="form" onSubmit={handleSubmit}>

        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <h4>Audio Recorder</h4>
        <br />

        <div>

          <button
            type="button"
            className="btn btn-block btn-primary"
            onClick={startAudioRecording}
            disabled={continuousRecordingIsHappening}
            style={{
              marginTop: '5px'
            }}
          // disabled={isRecording}
          >
            Start for Today
          </button>

          <button
            type="button"
            className="btn btn-block btn-primary"
            onClick={stopAudioRecording}
            disabled={!continuousRecordingIsHappening || takingToAPatient}
            style={{
              marginTop: '5px'
            }}
          // disabled={isRecording}
          >
            Close for today
          </button>

        </div>
        <br />
        <div>
          <button
            type="button"
            className="btn btn-block btn-primary"
            onClick={generatePatientDetails}
          // disabled={isRecording}
          >
            Patient Details
          </button>

        </div>
        <br />
        <br />

        <div className="form-row">
          <label htmlFor="patientId" className="form-label">
            Patient ID:
          </label>
          <input
            type="number"
            id="patientId"
            name="patientId"
            className="form-input"
            value={patientId}
            required
            disabled={true}
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="patientName" className="form-label">
            Patient Name:
          </label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            className="form-input"
            value={patientName}
            disabled={true}
            required
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="patientAge" className="form-label">
            Patient Age:
          </label>
          <input
            type="number"
            id="patientAge"
            name="patientAge"
            className="form-input"
            value={patientAge}
            disabled={true}
            required
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="hospitalId" className="form-label">
            Hospital ID:
          </label>
          <input
            type="text"
            id="hospitalId"
            name="hospitalId"
            className="form-input"
            value={hospitalId}
            required
            disabled={true}
          />
        </div>
        <br />
        <div className="form-row">
          <label htmlFor="prescription" className="form-label">
            Prescription:
          </label>
          <textarea
            id="prescription"
            name="prescription"
            className="form-input prescription-textarea" // Add a custom class for styling
            value={prescription}
            disabled={!takingToAPatient}
            onChange={handlePrescriptionChange}
            style={{ width: '500px', height: '100px' }} // Set the height of the textarea
          />
        </div>
        <br />
        <button
          onClick={getNewTimeStamp}
          disabled={!takingToAPatient}
          className="btn btn-block btn-secondary"
        >
          Print Prescription
        </button>
        <div style={{ position: 'absolute', bottom: '50px', right: '50px' }}>
          <RecordingIndicator isRecording={takingToAPatient} />
        </div>
      </Form>
    </Wrapper>

  );
};

export default AddRecord;

