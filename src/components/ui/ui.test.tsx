import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseBanner } from "@/components/layout/course-banner";
import { Avatar } from "@/components/ui/avatar";
import { Badge, EmptyState, ProgressBar } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { Stars } from "@/components/ui/stars";

describe("Stars", () => {
  it("announces the rating and review count to screen readers", () => {
    render(<Stars value={4.3} count={3} />);
    expect(screen.getByRole("img", { name: "4.3 out of 5, 3 reviews" })).toBeInTheDocument();
  });

  it("uses the singular for one review and a clear label when there are none", () => {
    const { rerender } = render(<Stars value={5} count={1} />);
    expect(screen.getByRole("img", { name: "5 out of 5, 1 review" })).toBeInTheDocument();
    rerender(<Stars value={0} count={0} />);
    expect(screen.getByRole("img", { name: "No ratings yet" })).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });
});

describe("ProgressBar", () => {
  it("exposes progress semantics", () => {
    render(<ProgressBar value={62} label="Course progress" />);
    const bar = screen.getByRole("progressbar", { name: "Course progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "62");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});

describe("CourseBanner", () => {
  it("renders generated artwork (decorative) when there is no thumbnail", () => {
    const { container } = render(<CourseBanner title="Next.js" category="Web Development" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("is deterministic: the same course always gets the same artwork", () => {
    const a = render(<CourseBanner title="Same" category="Design" />).container.innerHTML;
    const b = render(<CourseBanner title="Same" category="Design" />).container.innerHTML;
    expect(a.replace(/b\d+/g, "id")).toBe(b.replace(/b\d+/g, "id"));
  });

  it("uses the thumbnail, and falls back to artwork if the image fails to load", () => {
    const { container } = render(<CourseBanner title="T" category="Design" thumbnailUrl="https://img.test/a.png" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "https://img.test/a.png");
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("Avatar", () => {
  it("shows initials when there is no picture", () => {
    render(<Avatar name="Amara Perera" />);
    expect(screen.getByText("AP")).toBeInTheDocument();
  });

  it("shows the picture when there is one", () => {
    const { container } = render(<Avatar name="Amara Perera" url="data:image/jpeg;base64,AAAA" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "data:image/jpeg;base64,AAAA");
  });
});

describe("Query", () => {
  it("shows a busy skeleton while loading", () => {
    render(
      <Query loading error={null}>
        content
      </Query>,
    );
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("announces errors", () => {
    render(
      <Query loading={false} error="Could not load">
        content
      </Query>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load");
  });

  it("renders children once loaded", () => {
    render(
      <Query loading={false} error={null}>
        content
      </Query>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

describe("small components", () => {
  it("Badge and EmptyState render their text", () => {
    render(
      <>
        <Badge tone="success">passed</Badge>
        <EmptyState title="Nothing here" description="Try later" />
      </>,
    );
    expect(screen.getByText("passed")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nothing here" })).toBeInTheDocument();
  });
});
