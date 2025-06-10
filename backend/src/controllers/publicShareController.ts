import { Request, Response } from 'express';
import PublicShareService from '../services/PublicShareService';

class PublicShareController {
  /**
   * @description Handles the request to get public share data.
   */
  public static async getPublicShareData(req: Request, res: Response): Promise<void> {
    try {
      const { shareId } = req.params;
      const data = await PublicShareService.getShareData(shareId);

      if (!data) {
        res.status(404).json({ message: '공유 링크를 찾을 수 없거나 유효하지 않습니다.' });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching public share data:', error);
      res.status(500).json({ message: '데이터를 불러오는 중 서버에서 오류가 발생했습니다.' });
    }
  }
}

export default PublicShareController; 