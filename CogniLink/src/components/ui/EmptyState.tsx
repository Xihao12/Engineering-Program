import './EmptyState.css';

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📚</div>
      <h2 className="empty-state-title">还没有书签</h2>
      <p className="empty-state-description">开始添加你的第一个书签吧！</p>
    </div>
  );
}

