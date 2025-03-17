import axios from 'axios';
import { getPlainTextFromSlate } from '../components/NoteEditor';

// This would come from an environment variable in a real app
const API_KEY = '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';

interface FlashCard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// Helper function to extract plain text from note content (which might be JSON)
const getPlainTextContent = (content: string): string => {
  try {
    // Try to parse as JSON (for Slate format)
    const parsed = JSON.parse(content);
    return getPlainTextFromSlate(parsed);
  } catch (e) {
    // If it's not valid JSON, return as is (legacy plain text format)
    return content;
  }
};

class PerplexityService {
  private readonly apiUrl = 'https://api.perplexity.ai/chat/completions';
  private readonly headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  /**
   * Generate flashcards from note content
   */
  async generateFlashcards(noteContent: string): Promise<FlashCard[]> {
    try {
      // Convert Slate document to plain text if needed
      const plainTextContent = getPlainTextContent(noteContent);
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates flashcards for studying. Format your response as a JSON array of objects with 'front' and 'back' properties."
            },
            {
              role: "user",
              content: `Generate 5 flashcards from the following note: ${plainTextContent}`
            }
          ]
        },
        { headers: this.headers }
      );

      const content = response.data.choices[0].message.content;
      
      // Extract JSON from the response
      let flashcards: FlashCard[] = [];
      
      // Try to extract JSON from code blocks first
      const jsonCodeBlockMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
        try {
          flashcards = JSON.parse(jsonCodeBlockMatch[1]);
          return flashcards;
        } catch (parseError) {
          console.log('Error parsing JSON from code block:', parseError);
          // Continue to other methods if this fails
        }
      }
      
      // Try to extract array directly
      const arrayMatch = content.match(/\[([\s\S]*?)\]/);
      if (arrayMatch && arrayMatch[0]) {
        try {
          flashcards = JSON.parse(arrayMatch[0]);
          return flashcards;
        } catch (parseError) {
          console.log('Error parsing JSON array:', parseError);
          // Continue to other methods if this fails
        }
      }
      
      // As a last resort, try to parse the entire content
      try {
        flashcards = JSON.parse(content);
        return flashcards;
      } catch (parseError) {
        console.log('Error parsing entire content as JSON:', parseError);
        throw new Error('Unable to parse flashcards from API response');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return [];
    }
  }

  /**
   * Generate quiz questions from note content
   */
  async generateQuiz(noteContent: string): Promise<QuizQuestion[]> {
    try {
      // Convert Slate document to plain text if needed
      const plainTextContent = getPlainTextContent(noteContent);
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that creates quiz questions from study notes."
            },
            {
              role: "user",
              content: `Generate 5 multiple-choice quiz questions with 4 options each from these notes: ${plainTextContent}. Return them in a JSON array of objects with fields: question, options (array of strings), and correctAnswer (0-indexed number). Only return valid JSON, nothing else.`
            }
          ]
        },
        { headers: this.headers }
      );

      // Extract the JSON string from the response
      const content = response.data.choices[0].message.content.trim();
      let quizQuestions: QuizQuestion[] = [];
      
      // Try to parse the JSON directly
      try {
        quizQuestions = JSON.parse(content);
        return quizQuestions;
      } catch (parseError) {
        console.log('Direct JSON parse failed:', parseError);
        
        // Try to extract JSON if surrounded by markdown code blocks or backticks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```|`([\s\S]*?)`/);
        if (jsonMatch) {
          try {
            const jsonStr = (jsonMatch[1] || jsonMatch[2]).trim();
            quizQuestions = JSON.parse(jsonStr);
            return quizQuestions;
          } catch (markdownParseError) {
            console.log('Markdown JSON extraction failed:', markdownParseError);
          }
        }
      }
      
      // As a last resort, try to manually extract the JSON
      console.error('Failed to parse quiz questions from API response');
      return [];
    } catch (error) {
      console.error('Error generating quiz:', error);
      return [];
    }
  }
}

export default new PerplexityService(); 