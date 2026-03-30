import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface ChatMessage {
  id: string;
  type?: string;
  height?: number;
  lineCount?: number;
  totalLines?: number;
  isEmpty?: boolean;
  item?: {
    sender?: boolean;
    senderName?: string;
    receiverName?: string;
    text?: string;
    path?: string;
    sendingTime?: string;
  };
  senderTextColor?: string;
  receiverTextColor?: string;
  senderBackground?: string;
  receiverBackground?: string;
  fontSize?: number;
  fontStyle?: string;
  fontFamily?: string;
  middleimage?: string;
  topText?: string;
  bottomtext?: string;
  text?: string;
  heightEstimate?: number;
}

interface DeviceSpecs {
  width: number;
  height: number;
  pageHeight: number;
  effectivePageHeight: number;
  scaleFactory: number;
  minSpaceRequired: number;
  chatBubblePadding: number;
  bookSpecs?: any;
}

interface PaginationConfig {
  targetFillRatio: number; // 0.7 = 70% page fill target
  minMessagesPerPage: number;
  maxMessagesPerPage: number;
  allowSplitLongMessages: boolean;
  prioritizeBalance: boolean;
}

interface PaginationResult {
  pages: ChatMessage[][];
  metrics: {
    averageFill: number;
    imbalanceFactor: number;
    totalPages: number;
    messagesPerPage: number[];
  };
  recommendations?: string[];
}

class AIPaginationService {
  private deviceSpecs: DeviceSpecs;
  private config: PaginationConfig;

  constructor(bookSpecs?: any) {
    const totalPageHeight = bookSpecs?.title?.includes("Square")
      ? height - 340
      : height - 240;

    this.deviceSpecs = {
      width,
      height,
      pageHeight: totalPageHeight,
      // Use 80% of page height as requested by user
      effectivePageHeight: totalPageHeight * 0.8,
      scaleFactory: 0.85,
      minSpaceRequired: totalPageHeight * 0.2, // 20% minimum space for 80% fill target
      chatBubblePadding: 8, // Minimal padding between bubbles
      bookSpecs,
    };

    this.config = {
      targetFillRatio: 0.8, // Target 80% fill as requested by user
      minMessagesPerPage: 2, // Reduced for 80% fill target
      maxMessagesPerPage: 15, // Reduced for 80% fill target
      allowSplitLongMessages: true,
      prioritizeBalance: true,
    };
  }

  /**
   * AI-powered message height estimation focusing on fontSize, text content, and media
   */
  private estimateMessageHeight(message: ChatMessage): number {
    // Handle special message types first
    if (message?.type === "toptext" || message?.type === "bottomtext") {
      return 35;
    }

    if (message?.type === "middleimage") {
      return message?.middleimage
        ? this.deviceSpecs.pageHeight * 0.3
        : this.deviceSpecs.pageHeight * 0.2;
    }

    // Get the actual text content - primary factor
    const text = message.item?.text || message?.text || "";

    // Get fontSize - secondary factor
    const fontSize = message?.fontSize || 14;

    // Calculate text-based height
    let totalHeight = 0;

    // 1. Sender info line (always present for chat bubbles)
    totalHeight += fontSize + 8; // fontSize + small margin

    // 2. Calculate text height based on fontSize and content (if text exists)
    if (text.trim()) {
      const lineHeight = fontSize * 1.3; // Standard line height ratio
      const bubbleWidth = this.deviceSpecs.width * 0.7; // Chat bubble max width
      const charWidth = fontSize * 0.45; // More accurate character width
      const effectiveWidth = bubbleWidth - 20; // Account for bubble padding

      // Calculate how many characters fit per line
      const charsPerLine = Math.floor(effectiveWidth / charWidth);

      // Count explicit line breaks
      const explicitBreaks = (text.match(/\n/g) || []).length;

      // Calculate total lines needed
      const textLines = Math.ceil(text.length / charsPerLine);
      const totalLines = Math.max(textLines, explicitBreaks + 1);

      // Add text height
      totalHeight += totalLines * lineHeight;
    }

    // 3. Media content (CRITICAL for preventing overflow)
    if (message.item?.path) {
      const isImage = this.isImagePath(message.item.path);
      if (isImage) {
        // Images are a major height factor - use responsive sizing matching ChatBubble
        // ChatBubble uses wp(25) for both width and height (square images)
        const responsiveSize = this.deviceSpecs.width * 0.25; // wp(25) equivalent
        totalHeight += responsiveSize + 20; // Image height + padding
      } else {
        // QR codes - ChatBubble uses wp(15)
        const qrSize = this.deviceSpecs.width * 0.15; // wp(15) equivalent
        totalHeight += qrSize + 15; // QR height + padding
      }

      // Extra spacing when both text and media are present
      if (text.trim()) {
        totalHeight += 15; // Additional spacing for mixed content
      }
    }

    // 4. Bubble padding (minimal but necessary)
    totalHeight += 20; // Top + bottom padding

    // 5. Message spacing
    totalHeight += 10; // Space between messages

    // 6. Apply safety margin for images and complex content
    const safetyMultiplier = message.item?.path ? 1.1 : 1.02; // Higher safety for media
    return Math.ceil(totalHeight * safetyMultiplier);
  }

  /**
   * Determine device-specific height multipliers
   */
  private getDeviceMultiplier(): number {
    const aspectRatio = this.deviceSpecs.height / this.deviceSpecs.width;

    // Tablet landscape
    if (aspectRatio < 1.5) return 0.95;

    // Phone portrait (standard)
    if (aspectRatio >= 1.5 && aspectRatio < 2.0) return 1.0;

    // Tall phones (iPhone X style)
    if (aspectRatio >= 2.0) return 1.05;

    return 1.0;
  }

  /**
   * Check if path is an image
   */
  private isImagePath(path: string): boolean {
    if (!path || typeof path !== "string") return false;
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "svg",
      "heic",
      "heif",
    ];
    const extension = path.split(".").pop()?.toLowerCase();
    return extension ? imageExtensions.includes(extension) : false;
  }

  /**
   * Preprocess messages: deduplicate, split long messages, normalize
   */
  private preprocessMessages(messages: ChatMessage[]): ChatMessage[] {
    const processed: ChatMessage[] = [];
    const seenTexts = new Set<string>();

    for (const message of messages) {
      // Skip special message types
      if (
        ["toptext", "bottomtext", "middleimage"].includes(message?.type || "")
      ) {
        processed.push({
          ...message,
          heightEstimate: this.estimateMessageHeight(message),
        });
        continue;
      }

      const messageText = message?.text || message?.item?.text || "";

      // Skip empty messages
      if (!messageText.trim()) {
        processed.push({
          ...message,
          heightEstimate: this.estimateMessageHeight(message),
        });
        continue;
      }

      // Deduplicate based on text content
      if (seenTexts.has(messageText)) {
        continue;
      }
      seenTexts.add(messageText);

      // Split extremely long messages if enabled
      if (this.config.allowSplitLongMessages) {
        const fontSize = message?.fontSize || 14;
        const lineHeight = fontSize * 1.3;
        const bubbleWidth = this.deviceSpecs.width * 0.7;
        const charWidth = fontSize * 0.45;
        const charsPerLine = Math.floor((bubbleWidth - 20) / charWidth);

        // Calculate character threshold based on page capacity
        // Split if message would take more than 70% of page height
        const maxLinesPerMessage = Math.floor(
          (this.deviceSpecs.effectivePageHeight * 0.7) / lineHeight
        );
        const characterThreshold = charsPerLine * maxLinesPerMessage;

        if (messageText.length > characterThreshold) {
          const chunks = this.splitLongMessage(message, messageText);
          chunks.forEach((chunk) => {
            chunk.heightEstimate = this.estimateMessageHeight(chunk);
            processed.push(chunk);
          });
          continue;
        }
      }

      const processedMessage = {
        ...message,
        heightEstimate: this.estimateMessageHeight(message),
      };
      processed.push(processedMessage);
    }

    return processed;
  }

  /**
   * Split long messages into manageable chunks based on fontSize and page capacity
   */
  private splitLongMessage(message: ChatMessage, text: string): ChatMessage[] {
    const chunks: ChatMessage[] = [];
    const fontSize = message?.fontSize || 14;

    // Calculate optimal chunk size based on fontSize and page capacity
    const lineHeight = fontSize * 1.3;
    const bubbleWidth = this.deviceSpecs.width * 0.7;
    const charWidth = fontSize * 0.45;
    const charsPerLine = Math.floor((bubbleWidth - 20) / charWidth);

    // Calculate how many lines can fit in 60% of page height (leaving room for other messages)
    const maxLinesPerChunk = Math.floor(
      (this.deviceSpecs.effectivePageHeight * 0.6) / lineHeight
    );
    const chunkSize = charsPerLine * maxLinesPerChunk;

    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(i, i + chunkSize);
      const chunkMessage: ChatMessage = {
        ...message,
        id: `${message.id}_chunk_${Math.floor(i / chunkSize)}`,
      };

      // Update text content
      if (message.text) {
        chunkMessage.text = chunk;
      } else if (message.item) {
        chunkMessage.item = { ...message.item, text: chunk };

        // Only keep media in first chunk
        if (i > 0 && chunkMessage.item.path) {
          delete chunkMessage.item.path;
        }
      }

      chunks.push(chunkMessage);
    }

    return chunks;
  }

  /**
   * AI-powered pagination algorithm with advanced balancing
   */
  public paginateMessages(messages: ChatMessage[]): PaginationResult {
    // Step 1: Preprocess messages
    const processedMessages = this.preprocessMessages(messages);

    if (processedMessages.length === 0) {
      return {
        pages: [[]],
        metrics: {
          averageFill: 0,
          imbalanceFactor: 0,
          totalPages: 1,
          messagesPerPage: [0],
        },
      };
    }

    // Step 2: Calculate effective page height
    const effectivePageHeight = this.deviceSpecs.effectivePageHeight;
    const targetHeight = effectivePageHeight * this.config.targetFillRatio;

    // Step 3: Analyze message distribution
    const messageHeights = processedMessages.map(
      (msg) => msg.heightEstimate || 0
    );
    const totalContentHeight = messageHeights.reduce((sum, h) => sum + h, 0);
    const avgMessageHeight = totalContentHeight / messageHeights.length;

    // Step 4: AI-driven pagination strategy
    const strategy = this.selectPaginationStrategy(
      processedMessages,
      effectivePageHeight,
      avgMessageHeight
    );

    // Step 5: Execute pagination
    const pages = this.executePagination(
      processedMessages,
      effectivePageHeight,
      targetHeight,
      strategy
    );

    // Step 6: Calculate metrics and recommendations
    const metrics = this.calculateMetrics(pages, effectivePageHeight);
    const recommendations = this.generateRecommendations(metrics, strategy);

    return {
      pages,
      metrics,
      recommendations,
    };
  }

  /**
   * Select optimal pagination strategy based on content analysis including media
   */
  private selectPaginationStrategy(
    messages: ChatMessage[],
    pageHeight: number,
    avgHeight: number
  ): string {
    const totalMessages = messages.length;
    const estimatedPages = Math.ceil(
      (totalMessages * avgHeight) / (pageHeight * 0.8) // Updated to use 80% target
    );

    // Count messages with images/media for strategy adjustment
    const messagesWithMedia = messages.filter((msg) => msg.item?.path).length;
    const mediaRatio = messagesWithMedia / totalMessages;

    // More conservative strategy selection when images are present
    if (totalMessages <= 2) return "minimal";
    if (avgHeight > pageHeight * 0.5 || mediaRatio > 0.3)
      return "large_content"; // More conservative with media
    if (estimatedPages <= 1) return "compact";
    if (totalMessages > 15 && mediaRatio < 0.2) return "bulk"; // Only use bulk if few images

    return "balanced";
  }

  /**
   * Execute pagination with selected strategy
   */
  private executePagination(
    messages: ChatMessage[],
    pageHeight: number,
    targetHeight: number,
    strategy: string
  ): ChatMessage[][] {
    const pages: ChatMessage[][] = [];
    let currentPage: ChatMessage[] = [];
    let currentHeight = 0;
    let messageCount = 0;

    // Strategy-specific parameters
    const strategyParams = this.getStrategyParameters(strategy, pageHeight);

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageHeight = message.heightEstimate || 0;
      const totalHeight = messageHeight + this.deviceSpecs.chatBubblePadding;

      // Check if message fits on current page
      const wouldExceedHeight =
        currentHeight + totalHeight >
        pageHeight - this.deviceSpecs.minSpaceRequired;
      const wouldExceedTarget =
        currentHeight + totalHeight > strategyParams.maxPageHeight;
      const hasMinMessages = messageCount >= strategyParams.minMessages;
      const hasMaxMessages = messageCount >= strategyParams.maxMessages;

      // Extremely aggressive page filling - only break when absolutely necessary
      const shouldStartNewPage =
        currentPage.length > 0 &&
        (hasMaxMessages || // Hit absolute maximum message limit
          (wouldExceedHeight &&
            hasMinMessages &&
            currentHeight > pageHeight * 0.9)); // Only break if we're at 90%+ fill AND have minimum messages

      // Decide whether to start new page
      if (shouldStartNewPage) {
        pages.push([...currentPage]);
        currentPage = [];
        currentHeight = 0;
        messageCount = 0;
      }

      // Handle oversized messages - be extremely lenient
      if (totalHeight > pageHeight * 0.98) {
        // Increased from 0.95 to 0.98
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
          messageCount = 0;
        }
        pages.push([message]);
        continue;
      }

      // Add message to current page
      currentPage.push(message);
      currentHeight += totalHeight;
      messageCount++;

      // Check for optimal break points
      if (
        this.isOptimalBreakPoint(
          currentHeight,
          pageHeight,
          targetHeight,
          messageCount,
          strategyParams
        )
      ) {
        pages.push([...currentPage]);
        currentPage = [];
        currentHeight = 0;
        messageCount = 0;
      }
    }

    // Add final page if not empty
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // Post-process to merge single-message pages with adjacent pages
    const mergedPages = this.mergeSingleMessagePages(pages, pageHeight);

    return mergedPages.length > 0 ? mergedPages : [[]];
  }

  /**
   * Get strategy-specific parameters
   */
  private getStrategyParameters(strategy: string, pageHeight: number) {
    const baseParams = {
      minMessages: this.config.minMessagesPerPage,
      maxMessages: this.config.maxMessagesPerPage,
      maxPageHeight: pageHeight * 0.8, // Use 80% of effective page height
      targetFill: this.config.targetFillRatio,
    };

    switch (strategy) {
      case "minimal":
        return {
          ...baseParams,
          minMessages: 2,
          maxMessages: 6,
          targetFill: 0.75, // 75% fill for minimal strategy
        };
      case "compact":
        return {
          ...baseParams,
          minMessages: 3,
          maxMessages: 10,
          targetFill: 0.8, // 80% fill for compact strategy
        };
      case "large_content":
        return {
          ...baseParams,
          minMessages: 1,
          maxMessages: 3, // Reduced for better handling of images with 80% fill
          targetFill: 0.7, // 70% fill for large content strategy
        };
      case "bulk":
        return {
          ...baseParams,
          minMessages: 3,
          maxMessages: 12, // Reduced for 80% fill target
          targetFill: 0.78, // 78% fill for bulk strategy
        };
      default:
        return baseParams;
    }
  }

  /**
   * Determine if current position is an optimal break point
   */
  private isOptimalBreakPoint(
    currentHeight: number,
    pageHeight: number,
    targetHeight: number,
    messageCount: number,
    params: any
  ): boolean {
    const fillRatio = currentHeight / pageHeight;
    const targetRatio = targetHeight / pageHeight;

    // Optimal range for 80% target: 75-80% fill
    const isInOptimalRange = fillRatio >= 0.75 && fillRatio <= 0.8;
    const isNearTarget = Math.abs(fillRatio - targetRatio) < 0.1;
    const hasGoodMessageCount =
      messageCount >= params.minMessages && messageCount <= params.maxMessages;

    // Require at least minimum messages for the strategy
    const hasMinimumContent = messageCount >= params.minMessages;

    return (
      isInOptimalRange &&
      isNearTarget &&
      hasGoodMessageCount &&
      hasMinimumContent
    );
  }

  /**
   * Calculate pagination quality metrics
   */
  private calculateMetrics(pages: ChatMessage[][], pageHeight: number) {
    const fillRatios = pages.map((page) => {
      const pageContentHeight = page.reduce(
        (sum, msg) =>
          sum + (msg.heightEstimate || 0) + this.deviceSpecs.chatBubblePadding,
        0
      );
      return pageContentHeight / pageHeight;
    });

    const averageFill =
      fillRatios.reduce((sum, ratio) => sum + ratio, 0) / fillRatios.length;
    const variance =
      fillRatios.reduce(
        (sum, ratio) => sum + Math.pow(ratio - averageFill, 2),
        0
      ) / fillRatios.length;
    const imbalanceFactor = Math.sqrt(variance);
    const messagesPerPage = pages.map((page) => page.length);

    return {
      averageFill,
      imbalanceFactor,
      totalPages: pages.length,
      messagesPerPage,
    };
  }

  /**
   * Generate AI recommendations for pagination improvement
   */
  private generateRecommendations(metrics: any, strategy: string): string[] {
    const recommendations: string[] = [];

    if (metrics.averageFill < 0.5) {
      recommendations.push(
        "Consider increasing font size or adding more content per page for better space utilization."
      );
    }

    if (metrics.averageFill > 0.8) {
      recommendations.push(
        "Pages are very full. Consider reducing font size or splitting content across more pages."
      );
    }

    if (metrics.imbalanceFactor > 0.3) {
      recommendations.push(
        "Page content distribution is uneven. Consider redistributing messages for better balance."
      );
    }

    if (metrics.totalPages === 1 && metrics.messagesPerPage[0] > 10) {
      recommendations.push(
        "Single page contains many messages. Consider splitting into multiple pages for better readability."
      );
    }

    // Check for single-message pages
    const singleMessagePages = metrics.messagesPerPage.filter(
      (count: number) => count === 1
    ).length;
    if (singleMessagePages > 0) {
      recommendations.push(
        `${singleMessagePages} page(s) contain only one message. Consider adjusting target fill ratio or message grouping.`
      );
    }

    if (strategy === "large_content") {
      recommendations.push(
        "Content contains large messages. Pagination optimized for readability over density."
      );
    }

    return recommendations;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PaginationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update device specifications
   */
  public updateDeviceSpecs(newSpecs: Partial<DeviceSpecs>): void {
    this.deviceSpecs = { ...this.deviceSpecs, ...newSpecs };
  }

  /**
   * Merge single-message pages with adjacent pages to improve distribution
   */
  private mergeSingleMessagePages(
    pages: ChatMessage[][],
    pageHeight: number
  ): ChatMessage[][] {
    if (pages.length <= 1) return pages;

    const mergedPages: ChatMessage[][] = [];

    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];

      // If this is a single-message page, try to merge it
      if (currentPage.length === 1) {
        const message = currentPage[0];
        const messageHeight =
          (message.heightEstimate || 0) + this.deviceSpecs.chatBubblePadding;

        // Try to merge with previous page first
        if (mergedPages.length > 0) {
          const prevPage = mergedPages[mergedPages.length - 1];
          const prevPageHeight = prevPage.reduce(
            (sum, msg) =>
              sum +
              (msg.heightEstimate || 0) +
              this.deviceSpecs.chatBubblePadding,
            0
          );

          // If adding to previous page won't exceed 80% of page height
          if (prevPageHeight + messageHeight < pageHeight * 0.8) {
            prevPage.push(message);
            continue;
          }
        }

        // Try to merge with next page
        if (i + 1 < pages.length) {
          const nextPage = pages[i + 1];
          const nextPageHeight = nextPage.reduce(
            (sum, msg) =>
              sum +
              (msg.heightEstimate || 0) +
              this.deviceSpecs.chatBubblePadding,
            0
          );

          // If adding to next page won't exceed 80% of page height
          if (nextPageHeight + messageHeight < pageHeight * 0.8) {
            // Add current message to next page and skip next iteration
            nextPage.unshift(message);
            continue;
          }
        }
      }

      // If we couldn't merge, add the page as is
      mergedPages.push([...currentPage]);
    }

    return mergedPages;
  }
}

export default AIPaginationService;
export type { ChatMessage, PaginationResult, PaginationConfig, DeviceSpecs };
