% plotColor.m
%**************************************************************************
function plotColor(colorDist)
    
    %colorDist=colorDist{1};
    [m,n]=size(colorDist);
    width=2;length=2;
    stPoint=[2,16];
    hold on;
    axis square;
    axis([0 20 0 20]);
    set(gca,'xtick', [],'ytick',[])
    
    %***************************Draw Boxes and text*******************************
    x=stPoint(1);
    y=stPoint(2);
    for i=1:m
        if (y-length)<0
            x=stPoint(1)+8;
            y=stPoint(2);
        end
        rectangle('Position',[x,y,width,length],'FaceColor',colorDist(i,3:5));
        if i==1
            str=['< ' num2str(colorDist(i,2))];
        elseif i==m
            str=['> ' num2str(colorDist(i,1))];
        else
           str=[num2str(colorDist(i,1)) ' - ' num2str(colorDist(i,2))];     
        end
        text(x+width*1.2,y+length*0.5,str,'FontSize',8);
        y=y-length;
    end
    
end