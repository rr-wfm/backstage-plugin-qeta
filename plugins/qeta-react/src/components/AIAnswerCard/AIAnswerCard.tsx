import { Article, Post } from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useAI, useTranslation } from '../../hooks';
import FlareIcon from '@material-ui/icons/Flare';
import useDebounce from 'react-use/lib/useDebounce';

export type QetaAIAnswerCardClassKey = 'card';

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      card: {
        marginTop: theme.spacing(3),
        backgroundColor: theme.palette.background.default,
        border: `3px solid ${theme.palette.status.ok}`,
      },
      markdown: {},
    }),
  { name: 'QetaAIAnswerCard' },
);

export type AIAnswerCardProps = {
  question?: Post;
  draft?: {
    title: string;
    content: string;
  };
  article?: Article;
  debounceMs?: number;
  style?: React.CSSProperties;
};

export const AIAnswerCard = (props: AIAnswerCardProps) => {
  const { question, draft, article, style, debounceMs = 3000 } = props;
  const [answer, setAnswer] = React.useState<string | undefined>(undefined);
  const styles = useStyles();
  const { t } = useTranslation();

  const {
    isAIEnabled,
    answerExistingQuestion,
    answerDraftQuestion,
    summarizeArticle,
  } = useAI();

  useDebounce(
    () => {
      if (!isAIEnabled) {
        return;
      }

      if (question) {
        answerExistingQuestion(question.id).then(res => {
          setAnswer(res?.answer);
        });
      } else if (article) {
        summarizeArticle(article.id).then(res => {
          setAnswer(res?.answer);
        });
      } else if (
        draft &&
        draft.title &&
        draft.content &&
        draft.title.length + draft.content.length > 30
      ) {
        answerDraftQuestion(draft).then(res => {
          setAnswer(res?.answer);
        });
      } else {
        setAnswer(undefined);
      }
    },
    debounceMs,
    [answerExistingQuestion, answerDraftQuestion, isAIEnabled, question, draft],
  );

  if (!isAIEnabled || !answer) {
    return null;
  }

  return (
    <Card className={styles.card} style={style}>
      <CardHeader
        avatar={<FlareIcon />}
        title={
          <Typography variant="h5">
            {article ? t('aiAnswerCard.summary') : t('aiAnswerCard.answer')}
          </Typography>
        }
      />
      <CardContent>
        <MarkdownRenderer content={answer} className={styles.markdown} />
      </CardContent>
    </Card>
  );
};