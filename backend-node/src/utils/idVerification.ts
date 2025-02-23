import { ValidationError } from './errors';

interface IDVerificationResult {
  isValid: boolean;
  confidence: number;
  details: {
    name: string;
    idNumber: string;
    institute: string;
  }
}

const PIXTRAL_API_ENDPOINT = process.env.PIXTRAL_API_ENDPOINT || 'https://api.pixtral.com/v1/analyze';

export const verifyIDCard = async (imageBase64: string): Promise<IDVerificationResult> => {
  try {
    if (!process.env.PIXTRAL_API_KEY) {
      throw new Error('PIXTRAL_API_KEY not configured');
    }

    const response = await fetch(PIXTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PIXTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        image: imageBase64,
        prompt: `Analyze this image and verify if it's a valid IIT Mandi student/faculty ID card.
                Extract and verify:
                1. Full Name
                2. ID Number (format: [BF]20XXX)
                3. Institute name (must be IIT Mandi)
                
                Respond in JSON format:
                {
                  "isValid": boolean,
                  "confidence": number (0-1),
                  "details": {
                    "name": string,
                    "idNumber": string,
                    "institute": string
                  }
                }`,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pixtral API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate institute name
    const instituteName = data.details?.institute?.toLowerCase() || '';
    if (!instituteName.includes('iit mandi')) {
      return {
        isValid: false,
        confidence: 0,
        details: {
          name: '',
          idNumber: '',
          institute: '',
        },
      };
    }

    // Validate ID number format
    const idNumberRegex = /^[BF]20\d{3}$/;
    if (!idNumberRegex.test(data.details?.idNumber)) {
      return {
        isValid: false,
        confidence: 0,
        details: {
          name: '',
          idNumber: '',
          institute: '',
        },
      };
    }

    // Return normalized result
    return {
      isValid: data.isValid && data.confidence >= 0.85, // Require high confidence
      confidence: Math.min(Math.max(data.confidence, 0), 1), // Normalize to 0-1
      details: {
        name: data.details.name,
        idNumber: data.details.idNumber,
        institute: data.details.institute,
      },
    };
  } catch (error) {
    console.error('ID verification error:', error);
    throw new ValidationError('Failed to verify ID card. Please try again.');
  }
};
