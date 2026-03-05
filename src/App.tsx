import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Dices, RefreshCw, CheckCircle2, X, Info } from 'lucide-react';

const RED_BALLS = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
const BLUE_BALLS = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
const GREEN_BALLS = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49];

const getBallColorClass = (num: number) => {
  if (RED_BALLS.includes(num)) return 'bg-red-500 border-red-600 text-white';
  if (BLUE_BALLS.includes(num)) return 'bg-blue-500 border-blue-600 text-white';
  if (GREEN_BALLS.includes(num)) return 'bg-green-500 border-green-600 text-white';
  return 'bg-gray-500 border-gray-600 text-white';
};

const Ball = ({ num, isSelected, onClick, disabled, isSpecial = false, isMatched = false, showColorAlways = false }: any) => {
  const colorClass = getBallColorClass(num);
  const activeClass = showColorAlways || isSelected ? colorClass : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-400';
  
  return (
    <motion.button
      whileHover={!disabled && onClick ? { scale: 1.1 } : {}}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      onClick={() => onClick && onClick(num)}
      disabled={disabled}
      className={`
        relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm sm:text-base font-bold shadow-sm
        transition-all duration-200
        ${activeClass}
        ${isSelected && !showColorAlways ? 'ring-4 ring-offset-1 ring-yellow-400' : ''}
        ${disabled && !isSelected && !showColorAlways ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${!onClick ? 'cursor-default' : ''}
      `}
    >
      {num}
      {isSpecial && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm border border-yellow-500">
          特
        </span>
      )}
      {isMatched && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm border border-white"
        >
          <CheckCircle2 size={12} />
        </motion.div>
      )}
    </motion.button>
  );
};

export default function App() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [specialNumber, setSpecialNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [lastPrize, setLastPrize] = useState<{ name: string; amount: number } | null>(null);
  const [showRules, setShowRules] = useState(false);

  const BET_AMOUNT = 10;

  const toggleNumber = (num: number) => {
    if (isDrawing) return;
    
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < 6) {
        setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      }
    }
  };

  const quickPick = () => {
    if (isDrawing) return;
    const nums: number[] = [];
    while (nums.length < 6) {
      const r = Math.floor(Math.random() * 49) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setSelectedNumbers(nums.sort((a, b) => a - b));
    setWinningNumbers([]);
    setSpecialNumber(null);
    setLastPrize(null);
  };

  const clearSelection = () => {
    if (isDrawing) return;
    setSelectedNumbers([]);
    setWinningNumbers([]);
    setSpecialNumber(null);
    setLastPrize(null);
  };

  const draw = async () => {
    if (selectedNumbers.length !== 6 || balance < BET_AMOUNT || isDrawing) return;

    setBalance((prev) => prev - BET_AMOUNT);
    setIsDrawing(true);
    setWinningNumbers([]);
    setSpecialNumber(null);
    setLastPrize(null);

    // Generate winning numbers
    const nums: number[] = [];
    while (nums.length < 7) {
      const r = Math.floor(Math.random() * 49) + 1;
      if (!nums.includes(r)) nums.push(r);
    }

    const normalWins = nums.slice(0, 6).sort((a, b) => a - b);
    const specialWin = nums[6];

    // Simulate drawing animation
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setWinningNumbers((prev) => [...prev, normalWins[i]]);
    }
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSpecialNumber(specialWin);

    // Calculate prize
    calculatePrize(normalWins, specialWin);
    setIsDrawing(false);
  };

  const calculatePrize = (normalWins: number[], specialWin: number) => {
    let matchCount = 0;
    let hasSpecial = false;

    selectedNumbers.forEach((num) => {
      if (normalWins.includes(num)) matchCount++;
      if (num === specialWin) hasSpecial = true;
    });

    let prizeName = '未中奖 (No Prize)';
    let prizeAmount = 0;

    if (matchCount === 6) {
      prizeName = '头奖 (1st Prize)';
      prizeAmount = 8000000;
    } else if (matchCount === 5 && hasSpecial) {
      prizeName = '二奖 (2nd Prize)';
      prizeAmount = 1000000;
    } else if (matchCount === 5) {
      prizeName = '三奖 (3rd Prize)';
      prizeAmount = 100000;
    } else if (matchCount === 4 && hasSpecial) {
      prizeName = '四奖 (4th Prize)';
      prizeAmount = 9600;
    } else if (matchCount === 4) {
      prizeName = '五奖 (5th Prize)';
      prizeAmount = 640;
    } else if (matchCount === 3 && hasSpecial) {
      prizeName = '六奖 (6th Prize)';
      prizeAmount = 320;
    } else if (matchCount === 3) {
      prizeName = '七奖 (7th Prize)';
      prizeAmount = 40;
    }

    setLastPrize({ name: prizeName, amount: prizeAmount });
    if (prizeAmount > 0) {
      setBalance((prev) => prev + prizeAmount);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">六合彩 Mark Six</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRules(true)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Info size={20} />
            </button>
            <div className="bg-black/20 px-4 py-1.5 rounded-full font-mono font-medium">
              余额: ${balance.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Results Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
            <RefreshCw size={18} className={isDrawing ? "animate-spin text-red-500" : "text-slate-400"} />
            开奖结果 (Draw Results)
          </h2>
          
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center min-h-[80px] bg-slate-50 rounded-xl p-4 border border-slate-100">
            {winningNumbers.length === 0 && !isDrawing && (
              <p className="text-slate-400 italic">等待开奖... (Waiting for draw...)</p>
            )}
            
            <AnimatePresence>
              {winningNumbers.map((num, i) => (
                <motion.div
                  key={`win-${i}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Ball num={num} showColorAlways={true} />
                </motion.div>
              ))}
              
              {specialNumber !== null && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-2xl font-light text-slate-300 mx-2"
                  >
                    +
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Ball num={specialNumber} showColorAlways={true} isSpecial={true} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Prize Announcement */}
          <AnimatePresence>
            {lastPrize && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl text-center font-medium ${
                  lastPrize.amount > 0 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <p className="text-lg">{lastPrize.name}</p>
                {lastPrize.amount > 0 && (
                  <p className="text-2xl font-bold mt-1">+${lastPrize.amount.toLocaleString()}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Selection Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">选择号码 (Pick Numbers)</h2>
              <p className="text-sm text-slate-500 mt-1">
                已选 {selectedNumbers.length}/6 (Selected)
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={quickPick}
                disabled={isDrawing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Dices size={18} />
                机选 (Quick Pick)
              </button>
              <button
                onClick={clearSelection}
                disabled={isDrawing || selectedNumbers.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <X size={18} />
                清空 (Clear)
              </button>
            </div>
          </div>

          {/* Selected Numbers Display */}
          <div className="flex flex-wrap gap-2 mb-8 min-h-[48px]">
            {selectedNumbers.length === 0 ? (
              <div className="w-full text-center py-3 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                请从下方选择6个号码 (Please select 6 numbers below)
              </div>
            ) : (
              selectedNumbers.map((num) => (
                <Ball 
                  key={`sel-${num}`} 
                  num={num} 
                  showColorAlways={true}
                  isMatched={winningNumbers.includes(num) || specialNumber === num}
                  isSpecial={specialNumber === num}
                />
              ))
            )}
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 justify-items-center">
            {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.includes(num);
              const isDisabled = !isSelected && selectedNumbers.length >= 6 || isDrawing;
              
              return (
                <Ball
                  key={`grid-${num}`}
                  num={num}
                  isSelected={isSelected}
                  onClick={toggleNumber}
                  disabled={isDisabled}
                />
              );
            })}
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={draw}
              disabled={selectedNumbers.length !== 6 || isDrawing || balance < BET_AMOUNT}
              className={`
                px-12 py-4 rounded-full font-bold text-lg shadow-lg transition-all
                ${selectedNumbers.length === 6 && !isDrawing && balance >= BET_AMOUNT
                  ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-xl hover:-translate-y-1' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
              `}
            >
              {isDrawing ? '开奖中 (Drawing...)' : `投注并开奖 (Bet & Draw) - $${BET_AMOUNT}`}
            </button>
          </div>
          {balance < BET_AMOUNT && (
            <p className="text-center text-red-500 mt-2 text-sm">余额不足 (Insufficient balance)</p>
          )}
        </section>
      </main>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">奖金规则 (Prize Rules)</h3>
                <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm text-slate-600">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-800">头奖 (1st)</span>
                  <span>6个基本号码</span>
                  <span className="font-mono text-red-600 font-medium">$8,000,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-800">二奖 (2nd)</span>
                  <span>5个基本 + 特别号</span>
                  <span className="font-mono text-red-600 font-medium">$1,000,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-800">三奖 (3rd)</span>
                  <span>5个基本号码</span>
                  <span className="font-mono text-red-600 font-medium">$100,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-800">四奖 (4th)</span>
                  <span>4个基本 + 特别号</span>
                  <span className="font-mono text-red-600 font-medium">$9,600</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-800">五奖 (5th)</span>
                  <span>4个基本号码</span>
                  <span className="font-mono text-red-600 font-medium">$640</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-800">六奖 (6th)</span>
                  <span>3个基本 + 特别号</span>
                  <span className="font-mono text-red-600 font-medium">$320</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-slate-800">七奖 (7th)</span>
                  <span>3个基本号码</span>
                  <span className="font-mono text-red-600 font-medium">$40</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setShowRules(false)}
                  className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  我知道了 (Got it)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
