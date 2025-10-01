"use client";

import React, { useState } from 'react';

const whatsappNumber = '9606081341';
const whatsappLink = `https://wa.me/${whatsappNumber}`;

export default function WhatsAppChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating WhatsApp Icon */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none"
        aria-label="Chat on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="white"
        >
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.416 27.632 14.692 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 18.238 7 17.13 7 16c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.07-6.29c-.276-.138-1.633-.805-1.886-.897-.253-.092-.437-.138-.62.138-.184.276-.713.897-.874 1.082-.161.184-.322.207-.598.069-.276-.138-1.166-.429-2.223-1.367-.822-.733-1.377-1.637-1.54-1.913-.161-.276-.017-.425.122-.563.125-.124.276-.322.414-.483.138-.161.184-.276.276-.46.092-.184.046-.345-.023-.483-.069-.138-.62-1.497-.849-2.052-.224-.54-.453-.467-.62-.476l-.527-.01c-.161 0-.46.069-.701.322-.241.253-.92.899-.92 2.191 0 1.292.943 2.541 1.074 2.717.138.184 1.855 2.832 4.5 3.86.63.272 1.12.434 1.504.555.632.201 1.208.173 1.663.105.508-.075 1.633-.667 1.864-1.312.23-.644.23-1.196.161-1.312-.069-.115-.253-.184-.529-.322z" />
        </svg>
      </button>

      {/* WhatsApp Popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-xs bg-white rounded-xl shadow-2xl border border-green-500 animate-fade-in flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-green-500 rounded-t-xl">
            <span className="text-white font-semibold">Chat with us on WhatsApp</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-green-100 text-xl font-bold focus:outline-none">&times;</button>
          </div>
          <div className="px-4 py-6 flex-1 flex flex-col justify-between">
            <div className="flex items-start space-x-2">
              <div className="bg-green-100 rounded-lg px-3 py-2 text-gray-800 text-sm shadow">
                Hello<br />Can we help you?
              </div>
            </div>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="m-4 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              width="24"
              height="24"
              fill="white"
              className="mr-2"
            >
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.416 27.632 14.692 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 18.238 7 17.13 7 16c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.07-6.29c-.276-.138-1.633-.805-1.886-.897-.253-.092-.437-.138-.62.138-.184.276-.713.897-.874 1.082-.161.184-.322.207-.598.069-.276-.138-1.166-.429-2.223-1.367-.822-.733-1.377-1.637-1.54-1.913-.161-.276-.017-.425.122-.563.125-.124.276-.322.414-.483.138-.161.184-.276.276-.46.092-.184.046-.345-.023-.483-.069-.138-.62-1.497-.849-2.052-.224-.54-.453-.467-.62-.476l-.527-.01c-.161 0-.46.069-.701.322-.241.253-.92.899-.92 2.191 0 1.292.943 2.541 1.074 2.717.138.184 1.855 2.832 4.5 3.86.63.272 1.12.434 1.504.555.632.201 1.208.173 1.663.105.508-.075 1.633-.667 1.864-1.312.23-.644.23-1.196.161-1.312-.069-.115-.253-.184-.529-.322z" />
            </svg>
            Open chat
          </a>
        </div>
      )}
    </>
  );
}
