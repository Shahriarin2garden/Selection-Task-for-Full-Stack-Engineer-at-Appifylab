ALTER TABLE "Like"
ADD CONSTRAINT "Like_exactly_one_target"
CHECK (
  (CASE WHEN "postId" IS NULL THEN 0 ELSE 1 END) +
  (CASE WHEN "commentId" IS NULL THEN 0 ELSE 1 END) = 1
);
