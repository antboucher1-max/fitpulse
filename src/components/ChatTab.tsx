// Fonction pour calculer la chaîne d'activité globale (Messages + Likes + Commentaires)
const calculateTotalStreak = (
  currentUserId?: string, 
  buddyId?: string, 
  messages: DBMessage[] = [], 
  posts: Post[] = []
) => {
  if (!currentUserId || !buddyId) return 0;

  // 1. Récupérer tous les jours où il y a eu un message échangé
  const interactionDates = new Set<string>();

  messages.forEach(m => {
    if (
      (m.sender_id === currentUserId && m.receiver_id === buddyId) ||
      (m.sender_id === buddyId && m.receiver_id === currentUserId)
    ) {
      if (m.created_at) {
        interactionDates.add(m.created_at.split('T')[0]);
      }
    }
  });

  // 2. Ajouter les jours où il y a eu des likes ou commentaires croisés sur les posts
  posts.forEach(post => {
    // Si le post appartient à l'un des deux et a été liké ou commenté par l'autre
    const isUserPost = post.user_id === currentUserId;
    const isBuddyPost = post.user_id === buddyId;

    if (isUserPost || isBuddyPost) {
      // Vérifier les likes
      if (post.liked_by?.includes(currentUserId) || post.liked_by?.includes(buddyId)) {
        if (post.created_at) interactionDates.add(post.created_at.split('T')[0]);
      }
      // Vérifier les commentaires
      post.comments?.forEach(c => {
        if (c.user_id === currentUserId || c.user_id === buddyId) {
          if (c.created_at) interactionDates.add(c.created_at.split('T')[0]);
        }
      });
    }
  });

  // Calcul du nombre de jours consécutifs en partant d'aujourd'hui
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateString = checkDate.toISOString().split('T')[0];

    if (interactionDates.has(dateString)) {
      streak++;
    } else if (i > 0) {
      // Si un jour est manqué (sauf aujourd'hui si pas encore actif), la chaîne s'arrête
      break;
    }
  }

  return streak;
};
