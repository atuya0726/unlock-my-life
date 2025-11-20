import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Achievement } from '@/types/achievement';

const achievementsFilePath = path.join(process.cwd(), 'data', 'achievements.json');

// GET: 全実績を取得
export async function GET() {
  try {
    const fileContents = await fs.readFile(achievementsFilePath, 'utf8');
    const achievements = JSON.parse(fileContents);
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error reading achievements:', error);
    return NextResponse.json({ error: 'Failed to read achievements' }, { status: 500 });
  }
}

// POST: 新規実績を追加
export async function POST(request: NextRequest) {
  try {
    const newAchievement: Achievement = await request.json();
    
    // バリデーション
    if (!newAchievement.id || !newAchievement.title || !newAchievement.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // 既存の実績を読み込む
    const fileContents = await fs.readFile(achievementsFilePath, 'utf8');
    const achievements: Achievement[] = JSON.parse(fileContents);
    
    // IDの重複チェック
    if (achievements.some(a => a.id === newAchievement.id)) {
      return NextResponse.json({ error: 'Achievement ID already exists' }, { status: 400 });
    }
    
    // 新しい実績を追加
    achievements.push(newAchievement);
    
    // ファイルに保存
    await fs.writeFile(achievementsFilePath, JSON.stringify(achievements, null, 2), 'utf8');
    
    return NextResponse.json(newAchievement, { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
  }
}



