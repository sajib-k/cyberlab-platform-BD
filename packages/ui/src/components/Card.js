"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const react_1 = __importDefault(require("react"));
const Card = ({ title, children, className = '' }) => {
    return (<div className={`bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg ${className}`}>
      {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
      {children}
    </div>);
};
exports.Card = Card;
