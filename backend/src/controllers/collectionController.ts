import { Request, Response } from 'express';
import Collection from '../models/Collection';

// Get all collections for authenticated user
export const getCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    // 기존 콜렉션 조회
    let collections = await Collection.find({ owner: userId }).sort({ createdAt: -1 });
    // 최초 조회 시, 콜렉션이 없으면 기본 4개를 자동 생성
    if (collections.length === 0) {
      const defaultConfigs = [
        { name: '시험', type: '시험', visibility: 'private', description: '입력하고 즐기세요. 시험대비 끝' },
        { name: '학습', type: '학습', visibility: 'private', description: '요점정리, 학습 준비물 등을 입력하세요.' },
        { name: '업무', type: '업무', visibility: 'private', description: '지시사항, 업무규칙을 입력하세요.' },
        { name: '일상', type: '일상', visibility: 'private', description: '곡 기억해야 할 숫자. 할 일을 입력하세요.' }
      ];
      await Collection.insertMany(
        defaultConfigs.map(cfg => ({ ...cfg, owner: userId }))
      );
      collections = await Collection.find({ owner: userId }).sort({ createdAt: -1 });
    }
    res.status(200).json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

// Create new collection
export const createCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { name, type, visibility, description } = req.body;
    const newCollection = new Collection({
      name,
      owner: userId,
      type: type || 'custom',
      visibility: visibility || 'private',
      description: description || ''
    });
    const saved = await newCollection.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
};

// Update existing collection
export const updateCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, type, visibility, description } = req.body;
    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    if (collection.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    collection.name = name ?? collection.name;
    collection.type = type ?? collection.type;
    collection.visibility = visibility ?? collection.visibility;
    collection.description = description ?? collection.description;
    const updated = await collection.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
};

// Delete a collection
export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    if (collection.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await collection.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
};

// Fetch single collection metadata
export const getCollectionById = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    if (collection.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.status(200).json(collection);
  } catch (error) {
    console.error('Error fetching collection by id:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
};

// Fetch all public collections (open market)
export const getPublicCollections = async (req: Request, res: Response) => {
  try {
    const collections = await Collection.find({ visibility: 'public' }).sort({ createdAt: -1 });
    res.status(200).json(collections);
  } catch (error) {
    console.error('Error fetching public collections:', error);
    res.status(500).json({ error: 'Failed to fetch public collections' });
  }
};