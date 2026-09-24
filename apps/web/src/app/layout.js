"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const react_1 = __importDefault(require("react"));
exports.metadata = {
    title: 'CyberLab — Cybersecurity Education Platform',
    description: 'Break Things Safely. Build Real Skills.',
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body className="bg-obsidian text-slate-100 min-h-screen">
        {children}
      </body>
    </html>);
}
