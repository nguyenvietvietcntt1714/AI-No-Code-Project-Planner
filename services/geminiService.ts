import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (idea: string, audience: string, hasImage: boolean): string => {
  let imageInstruction = '';
  if (hasImage) {
    imageInstruction = "\n\nLƯU Ý: Người dùng đã cung cấp một hình ảnh tham khảo. Hãy phân tích hình ảnh đó để hiểu rõ hơn về giao diện, bố cục, và cảm nhận mà họ mong muốn cho ứng dụng. Tích hợp những phân tích này vào các phần liên quan của kế hoạch, đặc biệt là phần Thiết kế UI/UX.";
  }

  return `
Bạn là một chuyên gia phát triển ứng dụng no-code và tư vấn chiến lược sản phẩm. Một người dùng muốn xây dựng một ứng dụng mà không cần viết bất kỳ dòng code nào.

Ý tưởng ứng dụng của họ là: "${idea}"
Đối tượng mục tiêu của họ là: "${audience}"
${imageInstruction}

Nhiệm vụ của bạn là tạo ra một kế hoạch hành động chi tiết từng bước để giúp họ biến ý tưởng này thành một ứng dụng hoàn chỉnh. Kế hoạch phải dễ hiểu cho người mới bắt đầu.

Hãy trình bày kế hoạch dưới dạng các bước rõ ràng, sử dụng markdown để định dạng, bao gồm:

## 1. Phân tích ý tưởng (Idea Analysis)
*   **Tính năng cốt lõi (MVP):** Xác định các tính năng quan trọng nhất để khởi chạy phiên bản đầu tiên.
*   **Luồng người dùng (User Flow):** Mô tả các bước chính mà người dùng sẽ thực hiện trong ứng dụng.

## 2. Lựa chọn công cụ (Tool Selection)
*   **Gợi ý:** Đề xuất 2-3 nền tảng no-code phù hợp nhất (ví dụ: Bubble, Glide, Adalo, Softr).
*   **Phân tích:** Giải thích ngắn gọn ưu/nhược điểm của từng nền tảng đối với dự án cụ thể này.

## 3. Thiết kế (Design)
*   **UI (Giao diện người dùng):** Gợi ý về bố cục, màu sắc và cảm nhận chung.
*   **UX (Trải nghiệm người dùng):** Các bước để đảm bảo ứng dụng dễ sử dụng và trực quan.

## 4. Xây dựng (Development)
*   **Cơ sở dữ liệu (Database):** Hướng dẫn cách cấu trúc các bảng dữ liệu chính.
*   **Logic (Workflows):** Giải thích cách xây dựng logic cho các tính năng cốt lõi.

## 5. Kiểm thử và Triển khai (Testing & Deployment)
*   **Kiểm thử (Testing):** Các phương pháp để kiểm tra lỗi và đảm bảo ứng dụng hoạt động đúng.
*   **Triển khai (Deployment):** Các bước để phát hành ứng dụng cho người dùng.

Toàn bộ kế hoạch phải được viết bằng tiếng Việt.
  `;
};

export const generatePlan = async (
  idea: string,
  audience: string,
  image?: { base64: string; mimeType: string }
): Promise<string> => {
  try {
    const prompt = buildPrompt(idea, audience, !!image);
    
    let contents: any;
    
    if (image) {
      const imagePart = {
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64,
        },
      };
      const textPart = {
        text: prompt
      };
      contents = { parts: [textPart, imagePart] };
    } else {
      contents = prompt;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating plan from Gemini:", error);
    throw new Error("Failed to generate plan.");
  }
};