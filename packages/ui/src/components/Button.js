"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const react_1 = __importDefault(require("react"));
const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white font-medium',
    outline: 'border border-slate-700 hover:border-slate-500 text-white font-medium',
};
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    return (<button className={`px-4 py-2 rounded-md transition ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>);
};
exports.Button = Button;
