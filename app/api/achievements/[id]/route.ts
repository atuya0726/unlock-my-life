import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Achievement } from '@/types/achievement';

const achievementsFilePath = path.join(process.cwd(), 'data', 'achievements.json');

// PUT: 実績を更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updatedAchievement: Achievement = await request.json();
    
    // 既存の実績を読み込む
    const fileContents = await fs.readFile(achievementsFilePath, 'utf8');
    const achievements: Achievement[] = JSON.parse(fileContents);
    
    // 実績を検索
    const index = achievements.findIndex(a => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }
    
    // 実績を更新
    achievements[index] = { ...updatedAchievement, id }; // IDは変更不可
    
    // ファイルに保存
    await fs.writeFile(achievementsFilePath, JSON.stringify(achievements, null, 2), 'utf8');
    
    return NextResponse.json(achievements[index]);
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 });
  }
}

// DELETE: 実績を削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // 既存の実績を読み込む
    const fileContents = await fs.readFile(achievementsFilePath, 'utf8');
    const achievements: Achievement[] = JSON.parse(fileContents);
    
    // 実績を検索
    const index = achievements.findIndex(a => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }
    
    // 実績を削除
    const deletedAchievement = achievements.splice(index, 1)[0];
    
    // ファイルに保存
    await fs.writeFile(achievementsFilePath, JSON.stringify(achievements, null, 2), 'utf8');
    
    return NextResponse.json(deletedAchievement);
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json({ error: 'Failed to delete achievement' }, { status: 500 });
  }
}

