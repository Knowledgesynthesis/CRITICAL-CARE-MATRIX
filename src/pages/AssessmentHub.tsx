import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { assessmentQuestions } from '@/data/assessment-questions';
import { GraduationCap, Check, X, RefreshCw } from 'lucide-react';

export function AssessmentHub() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null && !answeredQuestions.has(currentQuestionIndex)) {
      setShowExplanation(true);
      const newAnswered = new Set(answeredQuestions);
      newAnswered.add(currentQuestionIndex);
      setAnsweredQuestions(newAnswered);

      if (isCorrect) {
        setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
      } else {
        setScore({ ...score, total: score.total + 1 });
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setAnsweredQuestions(new Set());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const percentageScore = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Assessment Hub</h1>
        <p className="text-muted-foreground">Test your knowledge with practice questions</p>
      </div>

      {/* Score Card */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">
                  {score.correct} / {score.total}
                </p>
              </div>
              {score.total > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold">{percentageScore}%</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {currentQuestionIndex + 1} / {assessmentQuestions.length}
                </p>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <div className="flex gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${getDifficultyColor(
                  currentQuestion.difficulty
                )}`}
              >
                {currentQuestion.difficulty}
              </span>
              {currentQuestion.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correctAnswer;
              const showCorrect = showExplanation && isCorrectAnswer;
              const showIncorrect = showExplanation && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : showIncorrect
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${showExplanation && !isCorrectAnswer && !isSelected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    {showCorrect && <Check className="w-5 h-5 text-green-500 ml-2" />}
                    {showIncorrect && <X className="w-5 h-5 text-red-500 ml-2" />}
                  </div>
                </button>
              );
            })}
          </div>

          {!showExplanation && (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full mt-6"
            >
              Submit Answer
            </Button>
          )}

          {showExplanation && (
            <div className="mt-6">
              <div
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-red-500 bg-red-500/10'
                }`}
              >
                <p className="font-semibold mb-2 flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      Correct!
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-red-500" />
                      Incorrect
                    </>
                  )}
                </p>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentQuestionIndex === assessmentQuestions.length - 1}
          className="flex-1"
        >
          Next Question
        </Button>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Assessment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • This assessment contains {assessmentQuestions.length} questions covering various ICU physiology
            topics
          </p>
          <p>• Questions are tagged by topic and difficulty level</p>
          <p>• Read each question carefully and select your answer</p>
          <p>• After submitting, you'll see an explanation of the correct answer</p>
          <p>• Use this tool to reinforce learning and identify knowledge gaps</p>
          <p>
            • Remember: This is for educational purposes only. Not for clinical decision-making.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
