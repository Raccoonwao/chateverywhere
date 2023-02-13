import React from "react";
import "./App.css";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import Card from 'react-bootstrap/Card';
import Toast from 'react-bootstrap/Toast';

const chatUrl = 'https://api.openai.com/v1/completions'
const config = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.REACT_APP_CHAT_API_KEY}`
  }
};

function App() {
  const [data, setData] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState([])
  const [toastStatus, setToastStatus] = React.useState({ show: false, message: '' })

  const hideToast = () => setToastStatus({ show: false })
  const showToast = (message) => setToastStatus({ show: true, message })

  const createChatData = (data) => ({
    "model": "text-davinci-003",
    "prompt": data,
    "max_tokens": 4000,
    "temperature": 1.0
  })

  const send = (data) => {
    if (!data) {
      return
    }
    setData('')
    console.log(`send:${data}`, chatHistory)
    axios.post(chatUrl, createChatData(data), config)
      .then(resp => {
        console.log(`=== handle axios response`, data, resp)
        handleChatResponse(resp.data.choices?.[0]?.text)
      })
      .catch(e => handleError(e))
  }

  React.useEffect(() => {
      if (chatHistory.length > 0 && chatHistory[chatHistory.length-1].source === 'me') {
        console.log('send', chatHistory)
        send(chatHistory.at(-1)?.chat)
      }
    },
    [ chatHistory ]
  )

  const addChatHistory = (source, chat) => setChatHistory([...chatHistory, { source, chat, time: new Date() }])
  const addMyChat = () => addChatHistory('me', data)
  const handleChatResponse = (reply) => {
    const lastChat = chatHistory.at(-1)
    if (lastChat?.source === 'me') {
      addChatHistory('robot', reply)
    }
  }
  const handleError = e => {
    console.log(`axio error`, e)
    if (e.request) {
      showToast('Server timeout')
      return
    }
    if (e.response) {
      showToast(`Server error: ${e.status}`)
      return
    }
    console.log(`axios error`, e)
    showToast(`Unknown error: ${e.error}`)
  }

  const reset = () => setData('')
  const clearChat = () => setChatHistory([])
  const handleChange = (e) => setData(e.target.value)
  const handleKeyDown = e => {
    if (e.ctrlKey && e.code === 'Enter') {
      addMyChat()
    }
  }

  const cardStyle = {
    margin: '5px'
  }
  const getHeader = (history) => {
    if (history?.source === 'me') {
      return <Card.Header>You</Card.Header>
    } 
    return <Card.Header style={{background: '#ccc'}}>
      {/* <img src="chatgpt.png" alt="" width={32}/> */}
      ChatGPT</Card.Header>
  }
  const copyChat = () => {
    if (chatHistory.length>0) {
      navigator.clipboard.writeText(JSON.stringify(chatHistory))
    }
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

      <Button variant="outline-primary" onClick={reset} disabled={!data}>Reset</Button>{' '}
      <Button variant="outline-primary" onClick={addMyChat} disabled={!data}>Chat</Button>{' '}
      <Button variant="outline-primary" onClick={clearChat} disabled={!chatHistory?.length > 0}>Clear Chat</Button>{' '}
      <Button variant="outline-primary" onClick={copyChat} disabled={!chatHistory?.length > 0}>Copy Chat</Button>{' '}

      {
        chatHistory.map((h, index) =>
          <Card border={h.source === 'me' ? 'primary' : 'secondary'} key={'chat_' + index} style={cardStyle}>
            {getHeader(h)}
            <Card.Body>{h.chat}</Card.Body>
          </Card>)
      }
      <Toast onClose={hideToast} show={toastStatus.show} delay={3000} autohide
        bg='danger'
      >
        <Toast.Header>
          {/* <img
            src="holder.js/20x20?text=%20"
            className="rounded me-2"
            alt=""
          /> */}
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body>{toastStatus.message}</Toast.Body>
      </Toast>
    </div>
  );
}

export default App;
