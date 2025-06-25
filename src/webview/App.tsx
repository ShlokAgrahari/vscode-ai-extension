import React, { useEffect, useState, useRef } from "react";

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  setState: (state: any) => void;
  getState: () => any;
};

const vscode = acquireVsCodeApi();

type Message = {
  sender: string;
  message: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "AI", message: "Hello, what help do you need?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const atMatch = input.match(/@([\w.-]+)/);
    if (atMatch) {
      vscode.postMessage({ type: "request-file", filename: atMatch[1] });
    } else {
      setMessages(prev => [...prev, { sender: "You", message: input }]);
      vscode.postMessage({ type: "user-message", text: input });
    }

    setInput("");
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;

      if (message.type === "ai-reply") {
        setMessages(prev => [...prev, { sender: "AI", message: message.text }]);
      }

      if (message.type === "file-attached") {
        setMessages(prev => [
          ...prev,
          {
            sender: "System",
            message: `📎 Attached file: ${message.filename}\n\n${message.content}`,
          }
        ]);
      }

      if (message.type === "image-attached") {
        setMessages(prev => [
          ...prev,
          {
            sender: "System",
            message: `📎 Attached image: ${message.filename}\n\n![img](${message.dataUrl})`,
          }
        ]);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderMessage = (msg: Message) => {
    const lines = msg.message.split("\n");
    const messageBlocks: React.ReactNode[] = [];
    let codeBuffer: string[] = [];
    let isInCode = false;

    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (isInCode) {
          messageBlocks.push(
            <pre
              key={`code-${i}`}
              style={{
                background: "#1e1e1e",
                padding: "0.8rem",
                borderRadius: "8px",
                overflowX: "auto",
                color: "#d4d4d4",
                marginBottom: "1rem"
              }}
            >
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
          codeBuffer = [];
        }
        isInCode = !isInCode;
      } else if (isInCode) {
        codeBuffer.push(line);
      } else {
        if (line.startsWith("![img](")) {
          const match = line.match(/!\[img\]\((.*?)\)/);
          if (match) {
            messageBlocks.push(
              <img
                key={`img-${i}`}
                src={match[1]}
                alt="attachment"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "6px",
                  marginTop: "0.5rem"
                }}
              />
            );
          }
        } else {
          messageBlocks.push(
            <p key={`text-${i}`} style={{ margin: "0.2rem 0" }}>
              {line}
            </p>
          );
        }
      }
    });

    return (
      <div
        style={{
          marginBottom: "1rem",
          backgroundColor:
            msg.sender === "You"
              ? "#004d99"
              : msg.sender === "AI"
              ? "#2d2d2d"
              : "#3c3c3c",
          color: "#e8e8e8",
          padding: "1rem",
          borderRadius: "10px",
          whiteSpace: "pre-wrap"
        }}
      >
        <strong style={{ color: "#cfcfcf" }}>{msg.sender}:</strong>
        <div>{messageBlocks}</div>
      </div>
    );
  };

  
    return (
  <div
    style={{
      backgroundColor: "#1e1e1e",
      color: "#ffffff",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Consolas, monospace",
      overflow: "hidden" 
    }}
  >
    <div
      style={{
        flex: 1,
        overflowY: "auto", 
        backgroundColor: "#252526",
        borderRadius: "8px",
        padding: "1rem 1rem 0 1rem", 
      }}
    >
      {messages.map((msg, idx) => (
        <div key={idx}>{renderMessage(msg)}</div>
      ))}
      <div ref={chatEndRef} />
    </div>

    <div
      style={{
        display: "flex",
        padding: "1rem",
        backgroundColor: "#1e1e1e",
        borderTop: "1px solid #333",
      }}
    >
      <input
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "6px",
          backgroundColor: "#1e1e1e",
          color: "#fff",
          border: "1px solid #555",
          fontSize: "1rem"
        }}
        value={input}
        onChange={e => setInput((e.target as HTMLInputElement).value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        placeholder="Type your message..."
      />
      <button
        style={{
          marginLeft: "0.5rem",
          padding: "10px 16px",
          backgroundColor: "#007acc",
          border: "none",
          borderRadius: "6px",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer"
        }}
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  </div>
);

  
}
