import axios from 'axios';

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
              content: `Generate 5 flashcards from the following note: ${noteContent}`
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
      const response = await axios.post(
        this.apiUrl,
        {
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates quiz questions for studying. Format your response as a JSON array of objects with 'question', 'options' (array of strings), and 'correctAnswer' (index of correct option) properties."
            },
            {
              role: "user",
              content: `Generate 5 multiple-choice quiz questions from the following note: ${noteContent}`
            }
          ]
        },
        { headers: this.headers }
      );

      const content = response.data.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\[([\s\S]*?)\]/) ||
                        content;
      
      let quizQuestions: QuizQuestion[];
      
      if (jsonMatch && jsonMatch[1]) {
        quizQuestions = JSON.parse(jsonMatch[1] || jsonMatch);
      } else {
        // Fallback if no JSON detected
        quizQuestions = JSON.parse(content);
      }
      
      return quizQuestions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      return [];
    }
  }

  /**
   * Organize note content into structured format
   */
  async organizeContent(noteContent: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that organizes study notes into clear, structured formats with headings, subheadings, and bullet points."
            },
            {
              role: "user",
              content: `Organize the following study notes into a clear, structured format: ${noteContent}`
            }
          ]
        },
        { headers: this.headers }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error organizing content:', error);
      return noteContent;
    }
  }
}

export default new PerplexityService(); 