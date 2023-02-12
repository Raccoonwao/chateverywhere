import React from "react";
import "./App.css";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import Card from 'react-bootstrap/Card';
import Toast from 'react-bootstrap/Toast';
// import { response } from "express";


// https://react-bootstrap.netlify.app/components/buttons/#button-props
const chatUrl = 'https://api.openai.com/v1/completions'
const config = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
};

function App() {
  const [data, setData] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState([])
  const [toastStatus, setToastStatus] = React.useState({ show: false, message: '' })

  const hideToast = () => setToastStatus({ show: false })
  const showToast = (message) => setToastStatus({ show: true, message })

  const createChatData = () => ({
    "model": "text-davinci-003",
    "prompt": data,
    "max_tokens": 4000,
    "temperature": 1.0
  })

  const addChatHistory = (source, chat) => {
    console.log(chatHistory)
    setChatHistory([...chatHistory, { source, chat }])
  }
  const handleChatResponse = (reply) => {
    addChatHistory('robot', reply)
  }
  const handleError = e => {
    console.log(`axio error`, e)
    if (e.request) {
      showToast('Server timeout')
      return
    }
    if (e.response) {
      showToast(`Server error: ${e.status}` )
      return
    }

    showToast('Unknown error')
  }

  const send = () => {
    // console.log(`send:${data}`, chatHistory)
    if (data) {
      addChatHistory('me', data)
      setData('')
      console.log(`send:${data}`, chatHistory)
      axios.post(chatUrl, createChatData(), config)
        .then(resp => handleChatResponse(resp.data.choices?.[0]?.text))
        .catch(e => handleError(e))
    }
  }

  const reset = () => setData('')
  const handleChange = (e) => setData(e.target.value)
  const handleKeyDown = e => {
    if (e.ctrlKey && e.code === 'KeyA') {
      showToast('hellow world')
      return
    }
    if (e.ctrlKey && e.code === 'Enter') {
      send()
    }
  }
  // const showChatHistory = () => {
  //   const h = chatHistory.map(history => {
  //     return <Card>
  //       <Card.Body>{history.chat}</Card.Body>
  //       </Card>
  //   })
  //   return h
  // }

  const cardStyle = {
    margin: '5px'
  }

  return (
    <div className="App">
      <FloatingLabel
        controlId="floatingTextarea"
        label="Chat here (Ctrl+Enter to send)"
        className="mb-3"
      >
        <Form.Control as="textarea" placeholder="Leave a comment here" value={data} onChange={handleChange} onKeyDown={handleKeyDown} />
      </FloatingLabel>

      <Button variant="outline-primary" onClick={reset}>Reset</Button>{' '}
      <Button variant="outline-primary" onClick={send}>Chat</Button>

      {
        chatHistory.map((h, index) =>
          <Card border={h.source === 'me' ? 'primary' : 'secondary'} key={'chat_' + index} style={cardStyle}>
            <Card.Body>{h.chat}</Card.Body>
          </Card>)
      }
      <Toast onClose={hideToast} show={toastStatus.show} delay={3000} autohide 
        // bg='danger'
        >
        <Toast.Header>
          <img
            src="holder.js/20x20?text=%20"
            className="rounded me-2"
            alt=""
          />
          <strong className="me-auto">Error</strong>
          {/* <small>11 mins ago</small> */}
        </Toast.Header>
        <Toast.Body>{toastStatus.message}</Toast.Body>
      </Toast>
    </div>
  );
}

export default App;
