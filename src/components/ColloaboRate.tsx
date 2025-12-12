import React, { useState } from "react";
import { createPortal } from "react-dom";
// import axios from "axios";

interface CollaboratePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CollaboratePopup: React.FC<CollaboratePopupProps> = ({ isOpen, onClose }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  // const [username, setUsername] = useState('');
  // const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // stop mailto from opening

    const email = "hello@0110.sport";

    navigator.clipboard.writeText(email);
    setShowCopied(true);

    setTimeout(() => {
      setShowCopied(false);
    }, 3000);
  };

  function handleEmail(data: any) {
    setEmail(data.target.value);
  }

  function handleMessage(data: any) {
    setMessage(data.target.value);
  }

  // function handleUsername(data: any) {
  //   setUsername(data.target.value);
  // }

  async function handleSend() {
    // if (loading) return;

    // setLoading(true);

    // const payload = {
    //   name: "Test user",
    //   email: email,
    //   message: message,
    // };

    // try {
    //   const response = await axios.post("http://69.62.85.124:3054/api/email/contact", payload, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   console.log("API Response:", response.data);

    setShowSuccess(true);
    // } catch (error) {
    //   console.error("Error sending message:", error);
    //   alert("Something went wrong. Please try again later.");
    // } finally {
    //   setLoading(false);
    // }
  }

  if (!isOpen) return null;

  if (showSuccess) {
    return createPortal(
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="bg-white rounded-sm text-center px-10 py-10 w-[95%] md:w-full max-w-[480px] shadow-lg">
          <p className="BodyLarge leading-6 font-dm-regular Black2">Message sent.</p>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm text-center lg:px-10 lg:py-10 px-6 pt-6 pb-8 w-[95%] md:w-full space-y-10 max-w-[480px] shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="md:text-[50px] text-[36px] leading-11 Black2 font-dm-regular tracking-[-0.25px] md:leading-[60px]">
          Let’s collaborate.
        </h2>

        <div className="max-h-[calc(100vh-190px)] overflow-y-auto overflow-x-hidden space-y-10">
          <p className="BodyLarge font-dm-Medium Black2">
            Leave your email and we’ll get in touch.
          </p>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            {/* <div className="relative w-full">
              <input
                type="name"
                placeholder="username"
                onChange={(data) => handleUsername(data)}
                value={username}
                className="w-full BodyLarge leading-6 font-dm-Medium text-[#616161] h-12 bg-[#F1F5F8] rounded-sm px-3 py-2 focus:outline-none text-center"
              />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9AA0A6]" />
            </div> */}
            <div className="relative w-full group focus-within:[&>div]:bg-[#1967D2]">
              <input
                type="email"
                placeholder="your@email.com"
                onChange={(data) => handleEmail(data)}
                value={email}
                className="w-full BodyLarge leading-6 font-dm-bold placeholder:text-[#616161] hover:placeholder:text-[#616161] hover:text-[#616161] focus:text-[#616161] focus:placeholder:text-[#616161] active:text-[#616161]! h-12 bg-[#F1F5F8] rounded-sm px-3 py-2 focus:outline-none text-center [&:not(:placeholder-shown)+div]:bg-[#1967D2]"
              />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9AA0A6] group-hover:bg-[#212121] group-focus-within:bg-[#1967D2]" />
            </div>

            <div className="relative w-full mt-4 group focus-within:[&>div]:bg-[#1967D2]">
              <input
                placeholder="Optional message"
                onChange={(data) => handleMessage(data)}
                value={message}
                className="w-full BodyLarge leading-6 font-dm-bold placeholder:text-[#616161] hover:placeholder:text-[#616161] hover:text-[#616161] focus:text-[#616161] focus:placeholder:text-[#616161] active:text-[#616161]! h-12 bg-[#F1F5F8] rounded-sm px-3 py-2 focus:outline-none text-center [&:not(:placeholder-shown)+div]:bg-[#1967D2] flex items-center justify-center"
              />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9AA0A6] group-hover:bg-[#212121] group-focus-within:bg-[#1967D2]" />
            </div>



            <div className="p-px rounded-sm BodyLarge leading-6 bg-linear-to-b from-[#737373] to-[#0E0E0E]">
              <button
                type="button"
                onClick={handleSend}
                // disabled={loading}
                // className={`w-full cursor-pointer ${
                //   loading ? "bg-[#555]" : "bg-[#232323] hover:bg-[#2f2f2f]"
                // } text-white rounded-sm py-2 font-medium transition`}
                className={`w-full cursor-pointer text-white rounded-sm py-2 font-medium transition bg-[#232323] hover:bg-[#2f2f2f]`}
              >
                {/* {loading ? "Sending..." : "Send"} */}
                {"Send"}
              </button>
            </div>
          </form>

          <p className="Black2 BodyLarge leading-6 text-center">
            or email us directly:{" "}
            {/* <a href="mailto:hello@0110.sport" className="underline hidden md:inline-block">
              hello@0110.sport
            </a> */}
            <a
              href="mailto:hello@0110.sport"
              className="underline"
              onClick={handleClick}
            >
              hello@0110.sport
            </a>
          </p>
        </div>
      </div>

      {showCopied && (
        <div
          className="fixed inset-x-0 top-0 flex items-start justify-center pt-5 z-50"
          onClick={() => setShowCopied(false)}
        >
          <div className="bg-white rounded-sm text-center px-10 py-4 w-[95%] md:w-full max-w-[300px] shadow-lg">
            <p className="BodyLarge leading-6 font-dm-regular Black2">
              Email copied.
            </p>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
};

export default CollaboratePopup;
